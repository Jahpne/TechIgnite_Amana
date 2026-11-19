export interface Turn {
  role: 'user' | 'assistant'
  text: string
}

/** An action the assistant asked for. It runs only when the person replies 1. */
export interface Pending {
  /** The tool and its arguments. Plain data, so it can be stored. The bot re-checks them when the person replies 1. */
  tool: string
  args: Record<string, unknown>
  /** What will happen, written by the bot (not by the AI) from the checked details. */
  summary: string
  createdAt: number
}

export interface Login {
  step: 'idle' | 'awaiting_email' | 'awaiting_code'
  /** The masked address the code was sent to. */
  sentTo?: string
  codeRequestedAt: number
  wrongCodes: number
}

export interface Person {
  /** True once this person has been shown the welcome message. */
  welcomed: boolean
  token?: string
  tokenAt: number
  login: Login
  pending?: Pending
  history: Turn[]
  recent: number[]
}

/** Sign-in tokens last 7 days on the backend. Ask again a day early. */
export const TOKEN_TTL_MS = 6 * 24 * 60 * 60 * 1000
export const PENDING_TTL_MS = 10 * 60 * 1000
const HISTORY_TURNS = 8

export function newPerson(): Person {
  return { welcomed: false, tokenAt: 0, login: { step: 'idle', codeRequestedAt: 0, wrongCodes: 0 }, history: [], recent: [] }
}

export function isSignedIn(person: Person): boolean {
  return person.token !== undefined && Date.now() - person.tokenAt < TOKEN_TTL_MS
}

export function signOut(person: Person): void {
  person.token = undefined
  person.pending = undefined
  person.login = { step: 'idle', codeRequestedAt: 0, wrongCodes: 0 }
}

export function remember(person: Person, user: string, bot: string): void {
  person.history.push({ role: 'user', text: user }, { role: 'assistant', text: bot })
  person.history = person.history.slice(-HISTORY_TURNS)
}

export class SessionExpired extends Error {
  constructor() {
    super('The sign-in has expired.')
    this.name = 'SessionExpired'
  }
}
