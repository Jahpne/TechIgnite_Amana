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

await checkModel()
await startWhatsApp(reply)
