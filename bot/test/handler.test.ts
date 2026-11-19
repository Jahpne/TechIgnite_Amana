// Logic test for the bot. A fake Amana backend and a fake AI service (with tool calling) run
// locally, so it needs no network, no keys and no WhatsApp. Run it with: pnpm test
import http from 'node:http'

const AG_ID = '11111111-1111-4111-8111-111111111111'
const MS_ID = '22222222-2222-4222-8222-222222222222'

// ------------------------------------------------------------------ fake Amana backend
type Rec = { method: string; path: string; body: Record<string, unknown>; auth: string | undefined }
const writes: Rec[] = []
const reads: Rec[] = []
const otpRequests: { phone: string; email?: string }[] = []
const otpVerifies: { phone: string; code: string }[] = []
let otpMode: 'sent' | 'needsEmail' | 'debug' = 'sent'

function agreement(role: 'payer' | 'payee') {
  return {
    id: AG_ID, type: 'TRADE', status: 'EVIDENCE_IN', title: 'Samsung phone', totalAmount: '18000000', currency: 'NGN',
    disputeLock: false, viewerRole: role,
    nextAction: { key: 'confirm_receipt', label: 'Confirm receipt', actor: 'payer', isYours: role === 'payer' },
    approvals: { payer: '2026-11-18', payee: '2026-11-18', bothApproved: true },
    milestones: [{ id: MS_ID, title: 'Homepage', amount: '5000000', status: 'SUBMITTED', conditionsJson: ['client_approval'] }],
    payments: [], deliveries: [],
  }
}

const backend = http.createServer((req, res) => {
  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', () => {
    const body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
    const url = req.url ?? ''
    const auth = req.headers.authorization
    const send = (status: number, data: unknown) => res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(data))

    if (url === '/auth/otp/request') {
      otpRequests.push({ phone: String(body.phone), email: body.email as string | undefined })
      if (otpMode === 'sent') return send(201, { sent: true, channel: 'email', sentTo: 'a***@x.com' })
      if (otpMode === 'needsEmail') return send(201, { sent: false, channel: 'log', needsEmail: true })
      return send(201, { sent: false, channel: 'log', debugCode: '123456' })
    }
    if (url === '/auth/otp/verify') {
      otpVerifies.push({ phone: String(body.phone), code: String(body.code) })
      if (body.code !== '123456') return send(401, { statusCode: 401, message: 'Incorrect code' })
      const token = String(body.phone) === '+2348000000005' ? 'expired' : `tok-${body.phone}`
      return send(201, { token })
    }

    if (!auth || auth === 'Bearer expired') return send(401, { statusCode: 401, message: 'Invalid or expired token' })
    const rec: Rec = { method: req.method ?? '', path: url, body, auth }
    const role = auth === 'Bearer tok-+2348000000008' ? 'payee' : 'payer'

    if (req.method === 'GET') {
      reads.push(rec)
      if (url === '/agreements') return send(200, [agreement(role)])
      if (url === `/agreements/${AG_ID}`) return send(200, agreement(role))
      if (url === `/agreements/${AG_ID}/timeline`) return send(200, [])
      return send(404, { message: 'Not found' })
    }
    writes.push(rec)
    if (url === '/agreements') return send(201, { id: AG_ID })
    return send(201, {})
  })
})

// ------------------------------------------------------------------ fake AI (OpenAI-compatible, with tools)
type Msg = { role: string; content: string | null; tool_calls?: unknown[]; tool_call_id?: string }
const aiCalls: { messages: Msg[]; tools: { function: { name: string } }[]; auth: string | undefined }[] = []
const script: (Msg | 'fail')[] = []
const say = (content: string): Msg => ({ role: 'assistant', content })
const callTool = (name: string, args: unknown, id = 'call_1'): Msg => ({
  role: 'assistant', content: null,
  tool_calls: [{ id, type: 'function', function: { name, arguments: typeof args === 'string' ? args : JSON.stringify(args) } }],
})

const ai = http.createServer((req, res) => {
  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', () => {
    const body = JSON.parse(raw)
    aiCalls.push({ messages: body.messages, tools: body.tools, auth: req.headers.authorization })
    const next = script.shift()
    if (next === 'fail' || next === undefined) return res.writeHead(500, { 'content-type': 'application/json' }).end('{"error":{"message":"boom"}}')
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ choices: [{ index: 0, message: next, finish_reason: 'stop' }] }))
  })
})

await new Promise<void>((r) => backend.listen(0, () => r()))
await new Promise<void>((r) => ai.listen(0, () => r()))
process.env.BACKEND_URL = `http://localhost:${(backend.address() as { port: number }).port}`
process.env.AI_API_KEY = 'test-ai-key'
process.env.AI_BASE_URL = `http://localhost:${(ai.address() as { port: number }).port}/v1`
process.env.PUBLIC_WEB_URL = 'https://web.test'
process.env.LOG_LEVEL = 'silent'
process.env.BOT_RATE_LIMIT_PER_MINUTE = '40'

const { reply } = await import('../src/handler.ts')

let pass = 0, fail = 0
const check = (name: string, ok: boolean, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + extra}`) }
const reset = () => { writes.length = 0; reads.length = 0; aiCalls.length = 0; script.length = 0 }

async function signedIn(phone: string): Promise<void> {
  otpMode = 'sent'
  await reply(phone, 'hi')
  await reply(phone, '123456')
  reset()
}

// ================================================================== signing in
let r = await reply('+2348000000001', 'hi')
check('first message: a code is requested, not an AI call', otpRequests.at(-1)?.phone === '+2348000000001' && aiCalls.length === 0)
check('first message: asks for the emailed code and shows the masked address', r.includes('a***@x.com') && r.includes('6-digit'), r)
r = await reply('+2348000000001', '000000')
check('wrong code: the backend message comes back', r.includes('Incorrect code'), r)
r = await reply('+2348000000001', '123456')
check('right code: signed in', r.startsWith('You are signed in'), r)
check('sign-in: no write and no AI call', writes.length === 0 && aiCalls.length === 0)
reset()

otpMode = 'needsEmail'
r = await reply('+2348000000002', 'hello')
check('new number: asks for an email', r.includes('email address'), r)
r = await reply('+2348000000002', 'not an email')
check('bad email: asks again, no request sent', r.includes('valid email') && otpRequests.filter((o) => o.phone === '+2348000000002').length === 1, r)
otpMode = 'sent'
r = await reply('+2348000000002', 'me@x.com')
check('good email: sent with the code request', otpRequests.at(-1)?.email === 'me@x.com' && r.includes('6-digit'), JSON.stringify(otpRequests.at(-1)))

// ================================================================== reading with tools
await signedIn('+2348000000010')
script.push(callTool('list_my_agreements', {}), say('You have one order: Samsung phone, waiting for your confirmation.'))
r = await reply('+2348000000010', 'show my orders')
check('read tool: the endpoint was called as the person (their token)', reads.some((x) => x.path === '/agreements' && x.auth === 'Bearer tok-+2348000000010'))
check('read tool: the result went back to the AI', aiCalls[1]?.messages.at(-1)?.role === 'tool' && String(aiCalls[1]?.messages.at(-1)?.content).includes('Samsung phone'))
check('read tool: the AI was given the tools', aiCalls[0]?.tools.some((t) => t.function.name === 'confirm_receipt') === true)
check('read tool: the AI answer is returned', r.startsWith('You have one order'), r)
check('read tool: the AI key was sent as a bearer token', aiCalls[0]?.auth === 'Bearer test-ai-key')
reset()

// ================================================================== writing needs the person's own 1
script.push(callTool('create_protected_order', { item: 'iPhone 13', price_naira: 180000, buyer_phone: '08012345678' }))
r = await reply('+2348000000010', 'create an order for my iPhone 13 for 180000, buyer 08012345678')
check('write: a confirmation is shown with the details', r.includes('iPhone 13') && r.includes('₦180,000') && r.includes('08012345678') && r.includes('Reply 1'), r)
check('write: NOTHING was sent to the backend yet', writes.length === 0)
check('write: the AI was called once and stopped', aiCalls.length === 1)
r = await reply('+2348000000010', 'yes')
check('"yes" is not a confirmation: the request is shown again, nothing sent', r.includes('Reply 1') && writes.length === 0, r)
r = await reply('+2348000000010', '1')
check('"1": the order is created with integer kobo and the WhatsApp channel', writes[0]?.path === '/agreements' && writes[0]?.body.amount === 18000000 && writes[0]?.body.createdVia === 'WHATSAPP' && writes[0]?.body.buyerPhone === '08012345678', JSON.stringify(writes[0]?.body))
check('"1": the person gets the order link', r.includes('https://web.test/o/'), r)
check('"1": no AI call was needed', aiCalls.length === 1)
reset()

script.push(callTool('create_protected_order', { item: 'Laptop', price_naira: 90000, buyer_phone: '08099999999' }))
await reply('+2348000000010', 'sell a laptop 90000 to 08099999999')
r = await reply('+2348000000010', '2')
check('"2": cancelled, nothing sent', r.includes('cancelled') && writes.length === 0, r)
r = await reply('+2348000000010', '1')
check('a "1" with nothing waiting is not an action', writes.length === 0)
reset()

// ================================================================== money-moving tools
script.push(callTool('confirm_receipt', { agreement_id: AG_ID }))
r = await reply('+2348000000010', 'I got my phone')
check('confirm_receipt: asks first, naming the agreement and what happens', r.includes('Samsung phone') && r.includes('releases the payment'), r)
check('confirm_receipt: the confirm endpoint is NOT called yet', !writes.some((w) => w.path.endsWith('/confirm')))
r = await reply('+2348000000010', '1')
check('confirm_receipt: runs only after 1, with outcome CONFIRM', writes.some((w) => w.path === `/agreements/${AG_ID}/confirm` && w.body.outcome === 'CONFIRM'))
reset()

script.push(callTool('confirm_receipt', { agreement_id: AG_ID }), say('Okay, what would you like to know?'))
await reply('+2348000000010', 'I got my phone')
r = await reply('+2348000000010', 'actually what is the weather?')
check('a different message drops the waiting request', r.startsWith('Okay, what would you like'), r)
script.push(say('What did you mean by 1?'))
r = await reply('+2348000000010', '1')
check('after dropping it, a lone 1 runs nothing', writes.length === 0, JSON.stringify(writes))
reset()

script.push({ role: 'assistant', content: null, tool_calls: [
  { id: 'c1', type: 'function', function: { name: 'confirm_receipt', arguments: JSON.stringify({ agreement_id: AG_ID }) } },
  { id: 'c2', type: 'function', function: { name: 'approve_terms', arguments: JSON.stringify({ agreement_id: AG_ID }) } },
] })
r = await reply('+2348000000010', 'do everything')
check('two writes at once: only the first is asked', r.includes('Confirm you received') && !r.includes('Approve the terms'), r)
await reply('+2348000000010', '2')
reset()

script.push(callTool('report_problem', { agreement_id: AG_ID, reason: 'The box was empty' }))
r = await reply('+2348000000010', 'the box was empty')
await reply('+2348000000010', '1')
check('report_problem: sends outcome PROBLEM with the note', writes.some((w) => w.path.endsWith('/confirm') && w.body.outcome === 'PROBLEM' && w.body.note === 'The box was empty'))
reset()

// ================================================================== bad calls from the AI
script.push(callTool('get_agreement', { agreement_id: 'abc' }), say('I could not find that.'))
r = await reply('+2348000000010', 'show agreement abc')
check('invented id: rejected before any request, AI told why', reads.length === 0 && String(aiCalls[1]?.messages.at(-1)?.content).includes('must be an id'), String(aiCalls[1]?.messages.at(-1)?.content))
reset()

script.push(callTool('delete_everything', {}), say('I cannot do that.'))
r = await reply('+2348000000010', 'delete everything')
check('unknown tool: refused, no crash', String(aiCalls[1]?.messages.at(-1)?.content).includes('no tool called') && r === 'I cannot do that.', r)
reset()

script.push(callTool('get_agreement', '{not json'), say('Sorry.'))
r = await reply('+2348000000010', 'x')
check('broken tool arguments: handled, no crash', r === 'Sorry.', r)
reset()

script.push(callTool('create_protected_order', { item: 'Phone', price_naira: -5, buyer_phone: '08012345678' }), say('The price must be more than zero.'))
r = await reply('+2348000000010', 'sell a phone for -5')
check('bad amount: rejected, nothing asked', writes.length === 0 && r.startsWith('The price'), r)
reset()

// ================================================================== the AI breaking its rules
script.push(say("Sure! Reply with 1 to confirm and I'll create the order."), callTool('create_protected_order', { item: 'Phone', price_naira: 50000, buyer_phone: '08012345678' }))
r = await reply('+2348000000010', 'sell my phone for 50000 to 08012345678')
check('AI asked for a 1 itself: it is corrected and made to call the tool', r.includes('Create a protected order') && aiCalls.length === 2 && String(aiCalls[1]?.messages.at(-1)?.content).includes('SYSTEM NOTE'), r)
await reply('+2348000000010', '2')
reset()

script.push(say('Your money is held in a protected account.'), say('It sits in a secure escrow account.'))
r = await reply('+2348000000010', 'where is my money kept?')
check('storage claim twice: the bot gives the approved answer itself', r.startsWith('Amana holds the payment until the buyer confirms') && aiCalls.length === 2, r)
reset()

script.push(say('Amana holds the payment until the buyer confirms the delivery, and nobody can move it alone.'))
r = await reply('+2348000000010', 'is my money safe?')
check('the approved explanation passes the checks untouched', r.startsWith('Amana holds the payment') && aiCalls.length === 1, r)
reset()

script.push(say('**Hello**! Here is `your info`.\n## Orders'))
r = await reply('+2348000000010', 'hi')
check('markdown is removed for WhatsApp', r === 'Hello! Here is your info.\nOrders', JSON.stringify(r))
reset()

// ================================================================== roles
await signedIn('+2348000000008')
script.push(callTool('confirm_receipt', { agreement_id: AG_ID }), say('Only the buyer can confirm.'))
r = await reply('+2348000000008', 'confirm it')
check('wrong role: the seller cannot confirm receipt', r === 'Only the buyer can confirm.' && writes.length === 0, r)
reset()

// ================================================================== failures
script.push('fail')
r = await reply('+2348000000010', 'hello again')
check('AI down: a plain message, no crash', r.includes('not answering'), r)
reset()

await signedIn('+2348000000005')
script.push(callTool('list_my_agreements', {}))
r = await reply('+2348000000005', 'show my orders')
check('expired token: the person is told to sign in again', r.includes('sign-in has ended'), r)
otpRequests.length = 0
r = await reply('+2348000000005', 'hello')
check('after that, the next message starts a new sign-in', otpRequests.length === 1 && r.includes('6-digit'), r)
reset()

// ================================================================== sandbox auto sign-in
process.env.BOT_AUTO_LOGIN_DEBUG = 'true'
otpMode = 'debug'
script.push(say('Hello! How can I help?'))
r = await reply('+2348000000020', 'hi')
check('sandbox auto sign-in: signed in with the debug code, then answered', r === 'Hello! How can I help?' && otpVerifies.at(-1)?.code === '123456', r)
process.env.BOT_AUTO_LOGIN_DEBUG = 'false'
r = await reply('+2348000000021', 'hi')
check('flag off: the debug code is not used', r.includes('cannot send a sign-in code') && aiCalls.length === 1, r)
otpMode = 'sent'
reset()

// ================================================================== rate limit
let last = ''
for (let i = 0; i < 45; i++) last = await reply('+2348000000030', 'hi')
check('rate limit: asks the person to slow down', last.startsWith('You are sending messages quickly'), last)

console.log(`\n${pass} passed, ${fail} failed`)
backend.close(); ai.close()
process.exit(fail ? 1 : 0)
