import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidGroup,
  isJidNewsletter,
  isJidStatusBroadcast,
  isLidUser,
  jidNormalizedUser,
  normalizeMessageContent,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys'
import type { WAMessage, WASocket } from '@whiskeysockets/baileys'
import { writeFileSync } from 'node:fs'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import { config } from './config.js'
import { log, mask } from './log.js'

export type Responder = (phone: string, text: string) => Promise<string>

const RECONNECT_DELAY_MS = 3_000

/** "2348012345678@s.whatsapp.net" -> "+2348012345678". Returns null when it is not a phone number. */
function phoneFromJid(jid: string | null | undefined): string | null {
  if (!jid) return null
  const user = jidNormalizedUser(jid).split('@')[0]
  const digits = user?.replace(/\D/g, '') ?? ''
  return digits.length >= 8 ? `+${digits}` : null
}

/** WhatsApp sometimes hides the number behind an id (a "LID"). The real number is in the alt field. */
function senderPhone(message: WAMessage): string | null {
  const jid = message.key.remoteJid
  if (jid && isLidUser(jid)) return phoneFromJid(message.key.remoteJidAlt)
  return phoneFromJid(jid)
}

function textOf(message: WAMessage): string | undefined {
  const content = normalizeMessageContent(message.message)
  return content?.conversation ?? content?.extendedTextMessage?.text ?? undefined
}

/** Is this something the bot should answer? Only one-to-one chats that someone else started. */
function isDirectMessage(message: WAMessage): boolean {
  const jid = message.key.remoteJid
  if (!jid || message.key.fromMe || !message.message) return false
  return !(isJidGroup(jid) || isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid))
}

/** One message at a time per person, so replies cannot arrive out of order. */
const queues = new Map<string, Promise<void>>()
function inOrder(phone: string, work: () => Promise<void>): void {
  const next = (queues.get(phone) ?? Promise.resolve()).then(work).catch((error: unknown) => {
    log.error({ phone: mask(phone), err: error instanceof Error ? error.message : String(error) }, 'Message handling failed')
  })
  queues.set(phone, next)
}

export async function startWhatsApp(respond: Responder): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(config.authDir)
  const { version } = await fetchLatestBaileysVersion()

  const sock: WASocket = makeWASocket({
    version,
    auth: state,
    // Baileys wants a pino logger. Keep its own chatter quiet.
    logger: pino({ level: 'warn' }),
    browser: Browsers.macOS('Chrome'),
    markOnlineOnConnect: false,
    syncFullHistory: false,
  })

  sock.ev.on('creds.update', saveCreds)

  let pairingRequested = false

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      if (config.pairingPhone && !state.creds.registered) {
        if (!pairingRequested) {
          pairingRequested = true
          sock
            .requestPairingCode(config.pairingPhone)
            .then((code) => {
              log.info(`Pairing code: ${code}. On the phone: WhatsApp > Linked devices > Link with phone number instead.`)
            })
            .catch((error: unknown) => log.error({ err: String(error) }, 'Could not get a pairing code'))
        }
      } else {
        log.info('Scan this QR code: WhatsApp > Linked devices > Link a device.')
        qrcode.generate(qr, { small: true })
        // Optional: keep the newest QR in a file so another program can show it (a web page, for example).
        if (config.qrFile) writeFileSync(config.qrFile, qr)
      }
    }

    if (connection === 'open') {
      log.info('WhatsApp connected. The bot is answering messages.')
      if (config.qrFile) writeFileSync(config.qrFile, '')
    }

    if (connection === 'close') {
      const code = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)?.output?.statusCode
      if (code === DisconnectReason.loggedOut) {
        log.error(`Logged out of WhatsApp. Delete the ${config.authDir} folder and start the bot again to link a number.`)
        process.exit(1)
      }
      log.warn({ code }, 'WhatsApp connection closed. Reconnecting.')
      setTimeout(() => {
        startWhatsApp(respond).catch((error: unknown) => log.error({ err: String(error) }, 'Reconnect failed'))
      }, RECONNECT_DELAY_MS)
    }
  })

  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return

    for (const message of messages) {
      if (!isDirectMessage(message)) continue

      const jid = message.key.remoteJid!
      const phone = senderPhone(message)
      if (!phone) {
        log.warn('A message came from a sender with no readable phone number')
        continue
      }
      if (config.allowedPhones.size > 0 && !config.allowedPhones.has(phone.replace(/\D/g, ''))) {
        log.info({ phone: mask(phone) }, 'Ignored a message from a number that is not on the allow-list')
        continue
      }

      inOrder(phone, async () => {
        const text = textOf(message)?.trim()
        const answer = text
          ? await respond(phone, text)
          : 'I can read text messages only. Please type what you need, or send "help".'

        // Show "typing..." while the answer is worked out, then reply.
        await sock.sendPresenceUpdate('composing', jid).catch(() => undefined)
        await sock.sendMessage(jid, { text: answer })
        await sock.sendPresenceUpdate('paused', jid).catch(() => undefined)
      })
    }
  })
}
