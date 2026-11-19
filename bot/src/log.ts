import pino from 'pino'

// App log. Phone numbers are masked, and message text is never written to the log.
export const log = pino({ level: process.env.LOG_LEVEL ?? 'info' })

/** 2348012345678 -> 23480*****678, so logs stay useful without exposing a number. */
export function mask(phone: string): string {
  const d = phone.replace(/\D/g, '')
  return d.length <= 6 ? '***' : `${d.slice(0, 5)}${'*'.repeat(d.length - 8)}${d.slice(-3)}`
}
