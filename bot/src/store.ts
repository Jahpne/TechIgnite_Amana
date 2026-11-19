import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { config } from './config.js'
import { newPerson } from './sessions.js'
import type { Person } from './sessions.js'

// Where each person's chat state lives between messages.
// - Always-on server (Baileys): memory is fine.
// - Serverless (Vercel): every message may run on a fresh instance, so the state goes in Redis (Upstash),
//   encrypted, because it includes the person's sign-in token.

const STATE_TTL_SECONDS = 7 * 24 * 60 * 60
const LOCK_SECONDS = 90

export interface Store {
  load(phone: string): Promise<Person>
  save(phone: string, person: Person): Promise<void>
  /** True the first time an id is seen, false after. Used so a retried webhook is not answered twice. */
  firstTime(id: string): Promise<boolean>
  /** Runs work for one person at a time, so two messages from them never race. */
  exclusive<T>(phone: string, work: () => Promise<T>): Promise<T>
}

// ---------------------------------------------------------------- memory

export function memoryStore(): Store {
  const people = new Map<string, Person>()
  const seen = new Set<string>()
  const queues = new Map<string, Promise<unknown>>()
  return {
    async load(phone) {
      let person = people.get(phone)
      if (!person) {
        person = newPerson()
        people.set(phone, person)
      }
      return person
    },
    async save(phone, person) {
      people.set(phone, person)
    },
    async firstTime(id) {
      if (seen.has(id)) return false
      seen.add(id)
      if (seen.size > 5000) seen.delete(seen.values().next().value as string)
      return true
    },
    exclusive(phone, work) {
      const run = (queues.get(phone) ?? Promise.resolve()).then(work, work)
      queues.set(phone, run.catch(() => undefined))
      return run
    },
  }
}

// ---------------------------------------------------------------- encryption (AES-256-GCM)

function key(secret: string): Buffer {
  return createHash('sha256').update(secret).digest()
}

export function seal(plain: string, secret: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(secret), iv)
  const body = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64')
}

export function open(sealed: string, secret: string): string {
  const raw = Buffer.from(sealed, 'base64')
  const decipher = createDecipheriv('aes-256-gcm', key(secret), raw.subarray(0, 12))
  decipher.setAuthTag(raw.subarray(12, 28))
  return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8')
}

// ---------------------------------------------------------------- Redis over HTTP (Upstash REST)

type Command = (string | number)[]

async function redis(url: string, token: string, command: Command): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(command),
  })
  const data = (await response.json().catch(() => ({}))) as { result?: unknown; error?: string }
  if (!response.ok || data.error) throw new Error(`Redis error (${response.status})`)
  return data.result ?? null
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function redisStore(url: string, token: string, secret: string): Store {
  const run = (command: Command) => redis(url, token, command)
  return {
    async load(phone) {
      const sealed = await run(['GET', `person:${phone}`])
      if (typeof sealed !== 'string') return newPerson()
      try {
        return JSON.parse(open(sealed, secret)) as Person
      } catch {
        // Unreadable (for example the secret changed): start this person fresh.
        return newPerson()
      }
    },
    async save(phone, person) {
      await run(['SET', `person:${phone}`, seal(JSON.stringify(person), secret), 'EX', STATE_TTL_SECONDS])
    },
    async firstTime(id) {
      return (await run(['SET', `seen:${id}`, '1', 'NX', 'EX', 24 * 60 * 60])) === 'OK'
    },
    async exclusive(phone, work) {
      const lock = `lock:${phone}`
      const mine = randomBytes(8).toString('hex')
      const deadline = Date.now() + LOCK_SECONDS * 1000
      while ((await run(['SET', lock, mine, 'NX', 'EX', LOCK_SECONDS])) !== 'OK') {
        if (Date.now() > deadline) throw new Error('Could not get the lock for this person')
        await sleep(400)
      }
      try {
        return await work()
      } finally {
        // Release only our own lock.
        await run(['EVAL', 'if redis.call("get",KEYS[1])==ARGV[1] then return redis.call("del",KEYS[1]) end return 0', 1, lock, mine]).catch(
          () => undefined,
        )
      }
    },
  }
}

// ---------------------------------------------------------------- the one in use

let current: Store | undefined

/** Redis when it is configured (it then also needs STATE_SECRET), otherwise memory. */
export function store(): Store {
  if (!current) {
    const { redis: r, stateSecret } = config
    if (r) {
      if (!stateSecret) throw new Error('STATE_SECRET is required when Redis is used, because stored sign-in tokens are encrypted.')
      current = redisStore(r.url, r.token, stateSecret)
    } else {
      current = memoryStore()
    }
  }
  return current
}

/** For tests. */
export function useStore(next: Store | undefined): void {
  current = next
}
