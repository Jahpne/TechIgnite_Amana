// App log. Phone numbers are masked, and message text is never written to the log.
// A tiny logger with no dependencies, so the same code runs on a server and in a serverless function.
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 } as const
type Level = keyof typeof LEVELS

function write(level: Exclude<Level, 'silent'>, first: unknown, second?: unknown): void {
  const wanted = LEVELS[(process.env.LOG_LEVEL as Level | undefined) ?? 'info'] ?? LEVELS.info
  if (LEVELS[level] < wanted) return
  const [fields, message] = typeof first === 'string' ? [{}, first] : [first as object, second as string | undefined]
  const line = JSON.stringify({ level, time: new Date().toISOString(), ...fields, msg: message })
  if (level === 'error' || level === 'warn') console.error(line)
  else console.log(line)
}

type LogFn = (first: unknown, second?: string) => void
export const log: Record<'debug' | 'info' | 'warn' | 'error', LogFn> = {
  debug: (a, b) => write('debug', a, b),
  info: (a, b) => write('info', a, b),
  warn: (a, b) => write('warn', a, b),
  error: (a, b) => write('error', a, b),
}

/** 2348012345678 -> 23480*****678, so logs stay useful without exposing a number. */
export function mask(phone: string): string {
  const d = phone.replace(/\D/g, '')
  return d.length <= 6 ? '***' : `${d.slice(0, 5)}${'*'.repeat(d.length - 8)}${d.slice(-3)}`
}
