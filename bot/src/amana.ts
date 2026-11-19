import { config } from './config.js'

// The Amana backend's public API (amana-backend openapi.yaml), called with the person's own token.
// The backend checks who is a party to what, so the bot never holds more power than the person has.

export class AmanaError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'AmanaError'
    this.status = status
  }
}

async function call<T>(method: 'GET' | 'POST' | 'PATCH', path: string, token: string | null, body?: unknown): Promise<T> {
  const response = await fetch(`${config.backendUrl}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(25_000),
  })
  const raw = await response.text()
  let data: unknown
  try {
    data = raw ? JSON.parse(raw) : undefined
  } catch {
    data = raw
  }
  if (!response.ok) {
    const m = (data as { message?: unknown } | undefined)?.message
    const message = Array.isArray(m) ? m.join('; ') : typeof m === 'string' ? m : `The request failed (${response.status}).`
    throw new AmanaError(response.status, message)
  }
  return data as T
}

// ---------------------------------------------------------------- shapes (only what the bot reads)

export interface Party {
  name?: string | null
  phone: string
}

export interface Milestone {
  id: string
  title: string
  amount: string
  status: string
  conditionsJson: string[]
}

export interface Agreement {
  id: string
  type: 'TRADE' | 'MILESTONE'
  status: string
  title: string
  /** Kobo, as a string. */
  totalAmount: string
  currency: string
  disputeLock: boolean
  viewerRole: 'payer' | 'payee' | 'observer'
  payer?: Party
  payee?: Party
  nextAction: { key: string; label: string; actor: string; isYours: boolean }
  approvals?: { payer: string | null; payee: string | null; bothApproved: boolean }
  milestones?: Milestone[]
  payments?: { virtualAccountNumber: string | null; amount: string; status: string }[]
  deliveries?: { status: string; trackingUrl: string | null }[]
}

export interface OtpResult {
  sent: boolean
  channel?: 'email' | 'log'
  /** A masked address, for example a***@gmail.com. */
  sentTo?: string
  needsEmail?: boolean
  /** Sandbox only. */
  debugCode?: string
}

export interface CompiledTerms {
  total_amount: number
  currency: string
  milestones: { title: string; amount: number; conditions: string[]; verification: string }[]
  dispute_terms: string
}

// ---------------------------------------------------------------- calls

export const amana = {
  requestOtp: (phone: string, email?: string) => call<OtpResult>('POST', '/auth/otp/request', null, { phone, email }),
  verifyOtp: (phone: string, code: string) => call<{ token: string }>('POST', '/auth/otp/verify', null, { phone, code }),

  listAgreements: (token: string) => call<Agreement[]>('GET', '/agreements', token),
  getAgreement: (token: string, id: string) => call<Agreement>('GET', `/agreements/${id}`, token),
  timeline: (token: string, id: string) =>
    call<{ actor: string; action: string; toStatus: string | null; createdAt: string }[]>('GET', `/agreements/${id}/timeline`, token),
  paymentStatus: (token: string, id: string) =>
    call<{ payments: { status: string; amount: string }[]; balance: { held: string; released: string } }>('GET', `/payments/${id}`, token),
  compile: (token: string, body: { description: string; budgetAmount?: number }) =>
    call<{ terms: CompiledTerms; disclaimer: string }>('POST', '/agreements/compile', token, body),

  createTrade: (token: string, body: Record<string, unknown>) => call<{ id: string }>('POST', '/agreements', token, body),
  createMilestoneAgreement: (token: string, body: Record<string, unknown>) =>
    call<{ id: string }>('POST', '/agreements/milestone', token, body),
  approve: (token: string, id: string) => call<unknown>('POST', `/agreements/${id}/approve`, token),
  startDelivery: (token: string, id: string, body: Record<string, unknown>) =>
    call<unknown>('POST', `/agreements/${id}/delivery`, token, body),
  confirm: (token: string, id: string, body: { outcome: 'CONFIRM' | 'PROBLEM'; note?: string }) =>
    call<unknown>('POST', `/agreements/${id}/confirm`, token, body),
  dispute: (token: string, id: string, body: Record<string, unknown>) => call<unknown>('POST', `/agreements/${id}/dispute`, token, body),
  submitEvidence: (token: string, milestoneId: string, body: Record<string, unknown>) =>
    call<unknown>('POST', `/milestones/${milestoneId}/evidence`, token, body),
  approveMilestone: (token: string, milestoneId: string) => call<unknown>('POST', `/milestones/${milestoneId}/approve`, token),
  rejectMilestone: (token: string, milestoneId: string, reason: string) =>
    call<unknown>('POST', `/milestones/${milestoneId}/reject`, token, { reason }),
}
