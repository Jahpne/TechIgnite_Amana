// Test for the Redis store against a tiny fake of Upstash's REST API. Run: tsx test/redis.test.ts
import http from 'node:http'

const data = new Map<string, string>()
const fake = http.createServer((req, res) => {
  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', () => {
    const send = (code: number, body: unknown) => res.writeHead(code, { 'content-type': 'application/json' }).end(JSON.stringify(body))
    if (req.headers.authorization !== 'Bearer rt') return send(401, { error: 'unauthorized' })
    const [cmd, key, ...rest] = JSON.parse(raw) as (string | number)[]
    if (cmd === 'GET') return send(200, { result: data.get(String(key)) ?? null })
    if (cmd === 'SET') {
      if (rest.includes('NX') && data.has(String(key))) return send(200, { result: null })
      data.set(String(key), String(rest[0]))
      return send(200, { result: 'OK' })
    }
    if (cmd === 'EVAL') {
      const lock = String(rest[1]), mine = String(rest[2])
      if (data.get(lock) === mine) { data.delete(lock); return send(200, { result: 1 }) }
      return send(200, { result: 0 })
    }
    return send(400, { error: 'unknown' })
  })
})
await new Promise<void>((r) => fake.listen(0, () => r()))
const { redisStore } = await import('../src/store.ts')
const { newPerson } = await import('../src/sessions.ts')

let pass = 0, fail = 0
const check = (name: string, ok: boolean) => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`) }

const s = redisStore(`http://localhost:${(fake.address() as { port: number }).port}`, 'rt', 'state-secret')
check('new person when nothing is stored', (await s.load('+234')).welcomed === false)
const p = newPerson(); p.welcomed = true; p.token = 'tok-123'
await s.save('+234', p)
const loaded = await s.load('+234')
check('saved person comes back', loaded.welcomed === true && loaded.token === 'tok-123')
check('stored value does not contain the token in plain text', ![...data.values()].some((v) => v.includes('tok-123')))
check('firstTime: true once, then false', (await s.firstTime('m1')) === true && (await s.firstTime('m1')) === false)

let running = 0, overlap = false
const job = () => s.exclusive('+234', async () => { running++; if (running > 1) overlap = true; await new Promise((r) => setTimeout(r, 450)); running-- })
await Promise.all([job(), job()])
check('exclusive: two jobs for one person never overlap', !overlap)
check('exclusive: the lock is released', !data.has('lock:+234'))

console.log(`\n${pass} passed, ${fail} failed`)
fake.close()
process.exit(fail ? 1 : 0)
