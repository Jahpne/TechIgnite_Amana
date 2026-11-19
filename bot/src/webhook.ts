import { createHmac, timingSafeEqual } from 'node:crypto'
import { config } from './config.js'
import { reply } from './handler.js'
import { log, mask } from './log.js'
import { store } from './store.js'

// The official WhatsApp Business Platform (Cloud API) front door. Meta calls this address for every
// message. It works on a serverless host: it keeps no connection open and holds no state of its own.

const MAX_REPLY = 4000 // WhatsApp allows 4096 characters in one text message
const NON_TEXT = 'I can read text messages only. Please type what you need, or send "help".'

/** Does the X-Hub-Signature-256 header match the body? Meta signs every call with the app secret. */
export function validSignature(body: string, header: string | null, secret: string): boolean {
  if (!header?.startsWith('sha256=')) return false
  const expected = createHmac('sha256', secret).update(body).digest()
  const given = Buffer.from(header.slice('sha256='.length), 'hex')
  return given.length === expected.length && timingSafeEqual(given, expected)
}

export interface Incoming {
  id: string
  /** "+2348012345678" */
  phone: string
  text?: string
}

/** Pulls the messages out of Meta's payload. Anything that is not a message (delivery receipts) is skipped. */
export function parseMessages(payload: unknown): Incoming[] {
  const found: Incoming[] = []
  const entries = (payload as { entry?: unknown[] } | null)?.entry
  if (!Array.isArray(entries)) return found
  for (const entry of entries) {
    const changes = (entry as { changes?: unknown[] } | null)?.changes
    if (!Array.isArray(changes)) continue
    for (const change of changes) {
      const messages = (change as { value?: { messages?: unknown[] } } | null)?.value?.messages
      if (!Array.isArray(messages)) continue
      for (const m of messages) {
        const message = m as { id?: unknown; from?: unknown; type?: unknown; text?: { body?: unknown } }
        if (typeof message.id !== 'string' || typeof message.from !== 'string') continue
        const digits = message.from.replace(/\D/g, '')
        if (digits.length < 8) continue
        const body = message.type === 'text' && typeof message.text?.body === 'string' ? message.text.body : undefined
        found.push({ id: message.id, phone: `+${digits}`, text: body })
      }
    }
  }
  return found
}

/** Sends one text message through the Cloud API. */
export async function sendText(to: string, text: string): Promise<void> {
  const { token, phoneNumberId, apiBase } = config.whatsapp
  if (!token || !phoneNumberId) throw new Error('WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID are not set.')
  const response = await fetch(`${apiBase}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'text',
      text: { body: text.length > MAX_REPLY ? `${text.slice(0, MAX_REPLY - 1)}…` : text, preview_url: true },
    }),
  })
  if (!response.ok) {
    // The body can say what is wrong (for example a closed 24-hour window). It holds no secrets.
    const detail = (await response.text().catch(() => '')).slice(0, 300)
    throw new Error(`WhatsApp refused the message (${response.status}) ${detail}`)
  }
}

/** Answers one incoming message. Never throws: a failure here must not make Meta retry forever. */
export async function handleIncoming(message: Incoming): Promise<void> {
  const { phone } = message
  try {
    if (!(await store().firstTime(message.id))) return // Meta retried; we already answered this one.

    if (config.allowedPhones.size > 0 && !config.allowedPhones.has(phone.replace(/\D/g, ''))) {
      log.info({ phone: mask(phone) }, 'Ignored a message from a number that is not on the allow-list')
      return
    }

    const answer = message.text?.trim() ? await reply(phone, message.text) : NON_TEXT
    await sendText(phone, answer)
  } catch (error) {
    log.error({ phone: mask(phone), err: error instanceof Error ? error.message : String(error) }, 'Message handling failed')
  }
}

/**
 * The webhook. `defer` keeps work running after the 200 is returned (Vercel's waitUntil). Meta wants an
 * answer within seconds, while the AI can take longer, so the reply is worked out after responding.
 */
export async function handleWebhook(request: Request, defer: (work: Promise<unknown>) => void): Promise<Response> {
  const { verifyToken, appSecret } = config.whatsapp

  if (request.method === 'GET') {
    // Meta's one-time check when the webhook is set up.
    const q = new URL(request.url).searchParams
    if (verifyToken && q.get('hub.mode') === 'subscribe' && q.get('hub.verify_token') === verifyToken) {
      return new Response(q.get('hub.challenge') ?? '', { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  // Never accept unsigned calls: anyone could otherwise make the bot "receive" a message from any number.
  if (!appSecret) {
    log.error('WHATSAPP_APP_SECRET is not set, so incoming messages are being rejected.')
    return new Response('Not configured', { status: 500 })
  }
  const raw = await request.text()
  if (!validSignature(raw, request.headers.get('x-hub-signature-256'), appSecret)) {
    return new Response('Bad signature', { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  for (const message of parseMessages(payload)) defer(handleIncoming(message))
  return new Response('ok', { status: 200 })
}
