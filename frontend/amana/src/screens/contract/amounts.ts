// Pure helpers for the milestone-contract screens (S6 to S9).
// No React, no fetching. The logic workstream can reuse these for validation.
// The backend stays authoritative: it rejects terms whose milestone amounts do not sum to the total.

import { formatNaira } from '../../ui/status'
import type { AgreementView } from '../../ui/types'

// ---------------------------------------------------------------- terms draft

export type ConditionKey = 'client_approval' | 'tests_pass'
export type VerificationKey = 'client_approval' | 'automated_test'

export const CONDITION_LABELS: Record<ConditionKey, string> = {
  client_approval: 'Client approval',
  tests_pass: 'Automated tests pass',
}

export const VERIFICATION_LABELS: Record<VerificationKey, string> = {
  client_approval: 'Client approval',
  automated_test: 'Automated tests (GitHub CI)',
}

export const CONDITION_KEYS: ConditionKey[] = ['client_approval', 'tests_pass']
export const VERIFICATION_KEYS: VerificationKey[] = ['client_approval', 'automated_test']

export interface DraftMilestone {
  id: string
  title: string
  /** Whole naira as a digit string, exactly what AmountInput holds. */
  amount: string
  conditions: ConditionKey[]
  verification: VerificationKey
}

export interface TermsDraft {
  /** Whole naira as a digit string. */
  total: string
  milestones: DraftMilestone[]
  disputeTerms: string
}

export const DEFAULT_DISPUTE_TERMS = 'Payout paused; admin reviews evidence from both parties'

export function newDraftMilestone(id: string): DraftMilestone {
  return { id, title: '', amount: '', conditions: ['client_approval'], verification: 'client_approval' }
}

const asCondition = (key: string): ConditionKey | null =>
  key === 'client_approval' || key === 'tests_pass' ? key : null

/** Builds an editable draft from a view of the agreement. */
export function draftFromAgreement(a: AgreementView, disputeTerms = DEFAULT_DISPUTE_TERMS): TermsDraft {
  return {
    total: String(a.total),
    disputeTerms,
    milestones: a.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      amount: String(m.amount),
      conditions: m.conditions.map((c) => asCondition(c.key)).filter((c): c is ConditionKey => c !== null),
      verification: m.verification === 'automated_test' ? 'automated_test' : 'client_approval',
    })),
  }
}

export function draftsEqual(a: TermsDraft, b: TermsDraft): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

// ---------------------------------------------------------------- amounts

export function parseNaira(value: string): number {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : 0
}

export function sumMilestones(milestones: DraftMilestone[]): number {
  return milestones.reduce((sum, m) => sum + parseNaira(m.amount), 0)
}

export interface SumCheck {
  total: number
  sum: number
  /** total minus sum. Positive: not yet assigned. Negative: over the total. */
  difference: number
  ok: boolean
}

export function checkSum(draft: TermsDraft): SumCheck {
  const total = parseNaira(draft.total)
  const sum = sumMilestones(draft.milestones)
  const difference = total - sum
  const ok =
    total > 0 && draft.milestones.length > 0 && difference === 0 && draft.milestones.every((m) => parseNaira(m.amount) > 0)
  return { total, sum, difference, ok }
}

export function describeSum(check: SumCheck): string {
  if (check.total <= 0) return 'Enter the contract total.'
  if (check.difference > 0) return `${formatNaira(check.difference)} of the total is not assigned to a milestone yet.`
  if (check.difference < 0) return `Milestones are ${formatNaira(-check.difference)} over the contract total.`
  return `Milestones add up to ${formatNaira(check.total)}.`
}

/** Every reason the draft cannot be saved or approved yet. Empty means it is valid. */
export function draftIssues(draft: TermsDraft): string[] {
  const issues: string[] = []
  const check = checkSum(draft)
  if (draft.milestones.length === 0) issues.push('Add at least one milestone.')
  if (!check.ok && draft.milestones.length > 0) {
    if (draft.milestones.some((m) => parseNaira(m.amount) <= 0)) issues.push('Every milestone needs an amount above zero.')
    if (check.total > 0 && check.difference !== 0) issues.push(describeSum(check))
    if (check.total <= 0) issues.push('Enter the contract total.')
  }
  draft.milestones.forEach((m, i) => {
    const n = i + 1
    if (m.title.trim() === '') issues.push(`Milestone ${n} needs a title.`)
    if (m.conditions.length === 0) issues.push(`Milestone ${n} needs at least one release condition.`)
    if (m.verification === 'automated_test' && !m.conditions.includes('tests_pass')) {
      issues.push(`Milestone ${n} is checked by automated tests, so "${CONDITION_LABELS.tests_pass}" must be a condition.`)
    }
  })
  if (draft.disputeTerms.trim() === '') issues.push('Describe what happens if there is a dispute.')
  return issues
}

// ---------------------------------------------------------------- evidence

export const EVIDENCE_LIMITS = {
  maxFiles: 5,
  maxBytes: 5 * 1024 * 1024,
  types: ['image/png', 'image/jpeg', 'application/pdf'],
} as const

export const EVIDENCE_LIMITS_TEXT = 'PNG, JPG or PDF. Up to 5 MB each, and up to 5 files.'

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Returns an error message, or null when the file is allowed. */
export function validateEvidenceFile(file: { name: string; size: number; type: string }): string | null {
  if (!(EVIDENCE_LIMITS.types as readonly string[]).includes(file.type)) {
    return `${file.name} is not allowed. Use a PNG, JPG or PDF.`
  }
  if (file.size > EVIDENCE_LIMITS.maxBytes) {
    return `${file.name} is too large. The limit is ${formatBytes(EVIDENCE_LIMITS.maxBytes)} per file.`
  }
  return null
}

/** True for https://github.com/<owner>/<repo>/pull/<number>, optionally followed by a sub-page. */
/**
 * Any https link to the work: a published site, a Figma file, a Drive folder,
 * a GitHub pull request. Amana is for every kind of service, so the link field
 * must not assume software.
 */
export function isWorkLink(value: string): boolean {
  try {
    return new URL(value.trim()).protocol === 'https:'
  } catch {
    return false
  }
}

export function isGithubPrUrl(value: string): boolean {
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') return false
  return /^\/[\w.-]+\/[\w.-]+\/pull\/\d+(\/.*)?$/.test(url.pathname)
}
