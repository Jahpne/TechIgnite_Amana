import { createServer } from 'node:http'
import { config } from './config.js'
import { reply } from './handler.js'
import { aiEnabled, checkModel } from './llm.js'
import { log } from './log.js'
import { startWhatsApp } from './whatsapp.js'

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
