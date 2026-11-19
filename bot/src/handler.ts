import { runAgent } from './agent.js'
import { amana, AmanaError } from './amana.js'
import { config } from './config.js'
import { aiEnabled } from './llm.js'
import { log, mask } from './log.js'
import { PENDING_TTL_MS, SessionExpired, isSignedIn, personFor, remember, signOut } from './sessions.js'
import type { Person } from './sessions.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const AFFIRM = /^(yes|y|ok|okay|confirm|go ahead|proceed|sure|do it)$/i
const SIGNED_IN = Symbol('signed-in')

const EXPIRED_MESSAGE = 'Your sign-in has ended. Send any message and I will sign you in again.'

function tooFast(person: Person): boolean {
  const now = Date.now()
  person.recent = person.recent.filter((t) => now - t < 60_000)
  person.recent.push(now)
  return person.recent.length > config.rateLimitPerMinute
}

// ---------------------------------------------------------------- signing in by code

/** Starts a sign-in. Returns SIGNED_IN, or the message to send the person. */
async function requestCode(phone: string, person: Person, email?: string): Promise<string | typeof SIGNED_IN> {
  const result = await amana.requestOtp(phone, email)

  // Sandbox only: the backend hands back the code. Used for the sender's OWN number, never anyone else's.
  if (config.autoLoginDebug && result.debugCode) {
    const verified = await amana.verifyOtp(phone, result.debugCode)
    person.token = verified.token
    person.tokenAt = Date.now()
    person.login = { step: 'idle', codeRequestedAt: 0, wrongCodes: 0 }
    return SIGNED_IN
  }

  if (result.sent) {
    person.login = { step: 'awaiting_code', sentTo: result.sentTo, codeRequestedAt: Date.now(), wrongCodes: 0 }
    return `To make sure it is you, I emailed a 6-digit code${result.sentTo ? ` to ${result.sentTo}` : ''}. Reply with the code. (Reply "resend" for a new one.)`
  }

  if (result.needsEmail) {
    if (email) {
      // We sent an address, but the backend only takes one for a brand-new account.
      person.login = { step: 'idle', codeRequestedAt: 0, wrongCodes: 0 }
      return 'This number already has an Amana account with no email address on file, so I cannot email you a code here. Please sign in on the website, or ask the Amana team to add your email.'
    }
    person.login = { step: 'awaiting_email', codeRequestedAt: 0, wrongCodes: 0 }
    return 'Welcome to Amana. To sign you in I will email you a one-time code. What is your email address?'
  }

  return email
    ? 'I could not email a code to that address. Please check it and send it again.'
    : 'I cannot send a sign-in code right now. Please try again later.'
}

/** Handles one message from someone who is not signed in. Returns the reply, or SIGNED_IN to carry on. */
async function signIn(phone: string, person: Person, text: string): Promise<string | typeof SIGNED_IN> {
  const { step } = person.login

  if (step === 'awaiting_code') {
    if (/^resend$/i.test(text)) return requestCode(phone, person)
    if (/^\d{6}$/.test(text)) {
      try {
        const verified = await amana.verifyOtp(phone, text)
        person.token = verified.token
        person.tokenAt = Date.now()
        person.login = { step: 'idle', codeRequestedAt: 0, wrongCodes: 0 }
        return "You are signed in. What would you like to do? For example: show my orders, or create a protected order."
      } catch (error) {
        if (error instanceof AmanaError) {
          person.login.wrongCodes += 1
          return `${error.message}. Send the 6-digit code from the email, or reply "resend".`
        }
        throw error
      }
    }
    return `I am waiting for the 6-digit code I emailed${person.login.sentTo ? ` to ${person.login.sentTo}` : ''}. Reply with it, or reply "resend".`
  }

  if (step === 'awaiting_email') {
    const address = text.trim()
    if (!EMAIL.test(address)) return 'Please send a valid email address, for example name@example.com.'
    return requestCode(phone, person, address)
  }

  return requestCode(phone, person)
}

// ---------------------------------------------------------------- confirming an action with 1

/** The person answered while an action was waiting. Returns a reply, or null to treat the message as new. */
async function answerPending(person: Person, text: string): Promise<string | null> {
  const pending = person.pending
  if (!pending) return null

  if (Date.now() - pending.createdAt > PENDING_TTL_MS) {
    person.pending = undefined
    return text === '1' ? 'That request expired. Please ask again.' : null
  }

  if (text === '1') {
    person.pending = undefined
    try {
      return await pending.run(person.token!)
    } catch (error) {
      if (error instanceof AmanaError) {
        if (error.status === 401) throw new SessionExpired()
        return `That did not work: ${error.message}`
      }
      throw error
    }
  }

  if (text === '2' || /^(cancel|no|stop)$/i.test(text)) {
    person.pending = undefined
    return 'Okay, I cancelled that. Nothing was changed.'
  }

  // "yes" and friends are not a confirmation. Only a 1 is, so say so and keep the request open.
  if (AFFIRM.test(text)) return `${pending.summary}`

  // Anything else is a new request, so drop the old one.
  person.pending = undefined
  return null
}

// ---------------------------------------------------------------- the reply

/**
 * Works out the reply to one WhatsApp message.
 *
 * Signing in: the person proves it is them with a code emailed by the backend.
 * Doing things: the AI looks things up with tools and asks for actions. Every action that changes
 * something waits for the person's own reply of 1. The backend then checks the call as that person.
 */
export async function reply(phone: string, text: string): Promise<string> {
  const person = personFor(phone)
  const clean = text.trim()

  if (tooFast(person)) return 'You are sending messages quickly. Please wait a minute and try again.'

  try {
    if (!isSignedIn(person)) {
      // Drop a stale token, but keep the sign-in step: the person may be midway through it.
      person.token = undefined
      person.pending = undefined
      const outcome = await signIn(phone, person, clean)
      if (outcome !== SIGNED_IN) return outcome
    }

    const answered = await answerPending(person, clean)
    if (answered !== null) {
      remember(person, clean, answered)
      return answered
    }

    if (!aiEnabled) {
      return `My assistant is switched off right now. Please use the Amana website: ${config.webUrl}`
    }

    const result = await runAgent(person.token!, person.history, clean)
    if (!result) return 'My assistant is not answering right now. Please try again in a minute.'

    if (result.kind === 'confirm') person.pending = result.pending
    remember(person, clean, result.text)
    return result.text
  } catch (error) {
    if (error instanceof SessionExpired || (error instanceof AmanaError && error.status === 401 && isSignedIn(person))) {
      signOut(person)
      return EXPIRED_MESSAGE
    }
    if (error instanceof AmanaError) {
      log.warn({ phone: mask(phone), status: error.status }, 'Amana returned an error')
      return error.status === 400 || error.status === 409 || error.status === 429 ? error.message : 'Amana is not answering right now. Please try again in a minute.'
    }
    log.error({ phone: mask(phone), err: error instanceof Error ? error.message : String(error) }, 'Could not answer a message')
    return 'Something went wrong on my side. Please try again.'
  }
}
