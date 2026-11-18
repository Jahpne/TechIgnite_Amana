import type { AgreementStatus, MilestoneStatus, OutcomeState, Tone } from './types'

export interface StatusMeta {
  label: string
  tone: Tone
  icon: string
}

// Plain-language labels. Icons are text so colour is never the only signal.
// Statuses mirror the backend enum. Some mean different things for a trade and a milestone
// contract, so pass the agreement type to agreementStatusMeta when you know it.
export const agreementStatus: Record<AgreementStatus, StatusMeta> = {
  DRAFT: { label: 'Draft, awaiting approval', tone: 'neutral', icon: '✎' },
  AWAITING_PAYMENT: { label: 'Awaiting payment', tone: 'warning', icon: '₦' },
  FUNDED: { label: 'Funded, money held', tone: 'success', icon: '✓' },
  IN_PROGRESS: { label: 'In progress', tone: 'info', icon: '→' },
  EVIDENCE_IN: { label: 'Evidence submitted', tone: 'warning', icon: '▣' },
  RELEASABLE: { label: 'Ready to release', tone: 'success', icon: '✓' },
  PAYING_OUT: { label: 'Paying out', tone: 'info', icon: '⟳' },
  COMPLETED: { label: 'Completed', tone: 'success', icon: '✓' },
  DISPUTED: { label: 'Under dispute', tone: 'danger', icon: '!' },
  REFUNDED: { label: 'Refunded', tone: 'neutral', icon: '↩' },
  EXPIRED: { label: 'Expired', tone: 'neutral', icon: '×' },
}

const tradeOverrides: Partial<Record<AgreementStatus, StatusMeta>> = {
  IN_PROGRESS: { label: 'In delivery', tone: 'info', icon: '→' },
  EVIDENCE_IN: { label: 'Delivered, awaiting confirmation', tone: 'warning', icon: '▣' },
}

const milestoneContractOverrides: Partial<Record<AgreementStatus, StatusMeta>> = {
  IN_PROGRESS: { label: 'Work in progress', tone: 'info', icon: '→' },
  EVIDENCE_IN: { label: 'Evidence submitted, awaiting review', tone: 'warning', icon: '▣' },
}

export function agreementStatusMeta(status: AgreementStatus, type?: 'TRADE' | 'MILESTONE'): StatusMeta {
  const override = type === 'TRADE' ? tradeOverrides[status] : type === 'MILESTONE' ? milestoneContractOverrides[status] : undefined
  return override ?? agreementStatus[status]
}

export const milestoneStatus: Record<MilestoneStatus, StatusMeta> = {
  PENDING: { label: 'Not started', tone: 'neutral', icon: '○' },
  IN_PROGRESS: { label: 'In progress', tone: 'info', icon: '→' },
  SUBMITTED: { label: 'Submitted, checking', tone: 'info', icon: '⟳' },
  VERIFIED: { label: 'Verified, awaiting approval', tone: 'success', icon: '✓' },
  RELEASABLE: { label: 'Ready to release', tone: 'success', icon: '✓' },
  PAYING_OUT: { label: 'Paying out', tone: 'info', icon: '⟳' },
  PAID: { label: 'Paid', tone: 'success', icon: '✓' },
  REJECTED: { label: 'Rejected', tone: 'danger', icon: '!' },
  DISPUTED: { label: 'Disputed', tone: 'danger', icon: '!' },
}

export const outcomeState: Record<OutcomeState, StatusMeta> = {
  VERIFIED: { label: 'Verified', tone: 'success', icon: '✓' },
  AWAITING_EVIDENCE: { label: 'Awaiting evidence', tone: 'neutral', icon: '…' },
  NEEDS_HUMAN_REVIEW: { label: 'Needs human review', tone: 'warning', icon: '?' },
  FAILED: { label: 'Failed', tone: 'danger', icon: '!' },
  DISPUTED: { label: 'Disputed', tone: 'danger', icon: '!' },
}

export const formatNaira = (amount: number): string => `₦${amount.toLocaleString('en-NG')}`
