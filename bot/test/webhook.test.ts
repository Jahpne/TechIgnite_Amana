// Test for the WhatsApp Cloud API webhook: verification, signatures, parsing, replies sent through a
// fake Graph API, retries not answered twice, encrypted state. Needs no network or keys. Run: pnpm test
import { createHmac } from 'node:crypto'
import http from 'node:http'

const SECRET = 'app-secret'
const sent: { to: string; body: string; auth: string | undefined }[] = []
const backendCalls: string[] = []

const graph = http.createServer((req, res) => {
  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', () => {
    const data = JSON.parse(raw)
    sent.push({ to: data.to, body: data.text.body, auth: req.headers.authorization })
    res.writeHead(200, { 'content-type': 'application/json' }).end('{"messages":[{"id":"wamid.out"}]}')
  })
})
const backend = http.createServer((req, res) => {
  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', () => {
    backendCalls.push(`${req.method} ${req.url}`)
    res.writeHead(201, { 'content-type': 'application/json' }).end(JSON.stringify({ sent: true, channel: 'email', sentTo: 'a***@x.com' }))
  })
})
await new Promise<void>((r) => graph.listen(0, () => r()))
await new Promise<void>((r) => backend.listen(0, () => r()))

process.env.WHATSAPP_VERIFY_TOKEN = 'verify-me'
process.env.WHATSAPP_APP_SECRET = SECRET
process.env.WHATSAPP_TOKEN = 'graph-token'
process.env.WHATSAPP_PHONE_NUMBER_ID = '999'
process.env.WHATSAPP_API_BASE = `http://localhost:${(graph.address() as { port: number }).port}`
process.env.BACKEND_URL = `http://localhost:${(backend.address() as { port: number }).port}`
process.env.PUBLIC_WEB_URL = 'https://web.test'
process.env.LOG_LEVEL = 'silent'

const { handleWebhook, parseMessages, validSignature } = await import('../src/webhook.ts')
const { seal, open } = await import('../src/store.ts')

let pass = 0, fail = 0
const check = (name: string, ok: boolean, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + extra}`) }

const sign = (body: string) => `sha256=${createHmac('sha256', SECRET).update(body).digest('hex')}`
const payload = (id: string, from: string, text?: string) =>
  JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [{ changes: [{ value: { messages: [text === undefined ? { id, from, type: 'image' } : { id, from, type: 'text', text: { body: text } }] } }] }],
  })

async function post(body: string, signature = sign(body)) {
  const work: Promise<unknown>[] = []
  const response = await handleWebhook(
    new Request('https://bot.test/api/whatsapp', { method: 'POST', body, headers: { 'x-hub-signature-256': signature } }),
    (p) => work.push(p),
  )
  await Promise.all(work)
  return response
}

// ---- verification handshake
let r = await handleWebhook(new Request('https://bot.test/api/whatsapp?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=12345'), () => undefined)
check('verify: right token returns the challenge', r.status === 200 && (await r.text()) === '12345')
r = await handleWebhook(new Request('https://bot.test/api/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=1'), () => undefined)
check('verify: wrong token is refused', r.status === 403)

// ---- signatures
const body1 = payload('wamid.1', '2348000000001', 'hi')
r = await post(body1, 'sha256=' + '0'.repeat(64))
check('bad signature: rejected, nothing sent', r.status === 401 && sent.length === 0)
r = await post(body1, '')
check('missing signature: rejected', r.status === 401 && sent.length === 0)
check('signature helper: right and wrong', validSignature('x', sign('x'), SECRET) && !validSignature('x', sign('y'), SECRET))

// ---- a real message
r = await post(body1)
check('signed message: 200', r.status === 200)
check('first contact: the welcome is sent to the right number through the Graph API', sent.length === 1 && sent[0]!.to === '2348000000001' && sent[0]!.body.includes('Amana assistant') && sent[0]!.auth === 'Bearer graph-token', JSON.stringify(sent))
check('first contact: no sign-in code requested yet', backendCalls.length === 0)

// ---- Meta retries the same message id
await post(body1)
check('retry of the same message id: not answered twice', sent.length === 1)

// ---- state survives between calls (fresh "instances" share the store)
await post(payload('wamid.2', '2348000000001', 'start'))
check('second message continues the sign-in (code requested, reply says where it went)', backendCalls.some((c) => c.includes('/auth/otp/request')) && sent.at(-1)!.body.includes('a***@x.com'), JSON.stringify(sent.at(-1)))

// ---- non-text and non-message calls
await post(payload('wamid.3', '2348000000001'))
check('image: told to type', sent.at(-1)!.body.startsWith('I can read text messages only'))
const before = sent.length
r = await post(JSON.stringify({ entry: [{ changes: [{ value: { statuses: [{ id: 'x', status: 'delivered' }] } }] }] }))
check('delivery receipt: 200, no reply', r.status === 200 && sent.length === before)
r = await post('not json', sign('not json'))
check('invalid JSON: 400', r.status === 400)
check('parse: skips junk safely', parseMessages(null).length === 0 && parseMessages({ entry: [{}] }).length === 0)

// ---- encrypted state
const sealed = seal('{"token":"secret-token"}', 'state-secret')
check('state is encrypted and decrypts with the right secret only', !sealed.includes('secret-token') && open(sealed, 'state-secret') === '{"token":"secret-token"}' && (() => { try { open(sealed, 'other'); return false } catch { return true } })())

// ---- unsigned calls are refused when the app secret is missing
delete process.env.WHATSAPP_APP_SECRET
r = await post(body1)
check('no app secret configured: refuses everything', r.status === 500)

console.log(`\n${pass} passed, ${fail} failed`)
graph.close()
backend.close()
process.exit(fail ? 1 : 0)
