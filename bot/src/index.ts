import { mkdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { resolve } from 'node:path'
import { config } from './config.js'
import { reply } from './handler.js'
import { aiEnabled, checkModel } from './llm.js'
import { enableFileLog, log } from './log.js'
import { startWhatsApp } from './whatsapp.js'

// First, make the folders this program needs, so a fresh host needs nothing set up by hand:
// the log file (BOT_LOG_FILE, default ./logs/bot.log) and the WhatsApp login folder (BOT_AUTH_DIR).
const logFile = enableFileLog(resolve(process.env.BOT_LOG_FILE ?? './logs/bot.log'))
try {
  mkdirSync(config.authDir, { recursive: true })
} catch (error) {
  log.error({ authDir: resolve(config.authDir), err: String(error) }, 'Could not create the login folder')
}
log.info(
  { node: process.version, cwd: process.cwd(), logFile: logFile ?? 'none', authDir: resolve(config.authDir) },
  'Folders ready',
)

log.info(
  {
    backend: config.backendUrl,
    assistant: aiEnabled ? config.aiModel : 'off (no AI_API_KEY)',
    allowList: config.allowedPhones.size > 0 ? `${config.allowedPhones.size} number(s)` : 'everyone',
    signIn: config.autoLoginDebug ? 'sandbox auto sign-in (debug code)' : 'code by email',
  },
  'Starting the Amana WhatsApp bot',
)

process.on('unhandledRejection', (reason) => {
  log.error({ reason: String(reason) }, 'Unhandled rejection')
})

// Write the reason to the log before the program ends, so a crash is never silent.
process.on('uncaughtException', (error) => {
  log.error({ err: error.stack ?? String(error) }, 'The bot crashed')
  process.exit(1)
})

// Optional. Some hosts (a worker behind a web proxy) expect the program to listen on a port.
// Set BOT_HEALTH_PORT (or PORT) and the bot answers "ok" there. It serves nothing else and shows no data.
const healthPort = Number(process.env.BOT_HEALTH_PORT ?? process.env.PORT ?? '')
if (Number.isInteger(healthPort) && healthPort > 0) {
  createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/plain' }).end('Amana bot is running')
  }).listen(healthPort, () => log.info({ port: healthPort }, 'Health port open'))
}

await checkModel()
await startWhatsApp(reply)
