import type { AgreementStatus, MilestoneStatus, OutcomeState, Tone } from './types'

export interface StatusMeta {
  label: string
  tone: Tone
  icon: string
}

// Plain-language labels. Icons are text so colour is never the only signal.
export const agreementStatus: Record<AgreementStatus, StatusMeta> = {
  DRAFT: { label: 'Draft', tone: 'neutral', icon: '✎' },
  AWAITING_ACCEPTANCE: { label: 'Awaiting acceptance', tone: 'info', icon: '…' },
  AWAITING_PAYMENT: { label: 'Awaiting payment', tone: 'warning', icon: '₦' },
  PAYMENT_PENDING: { label: 'Verifying payment', tone: 'info', icon: '⟳' },
  FUNDED: { label: 'Funded, money held', tone: 'success', icon: '✓' },
  IN_DELIVERY: { label: 'In delivery', tone: 'info', icon: '→' },
  DELIVERED: { label: 'Delivered, awaiting confirmation', tone: 'warning', icon: '▣' },
  RELEASABLE: { label: 'Ready to release', tone: 'success', icon: '✓' },
  PAYOUT_PENDING: { label: 'Payout pending', tone: 'info', icon: '⟳' },
  PAYOUT_FAILED: { label: 'Payout failed', tone: 'danger', icon: '!' },
  DISPUTED: { label: 'Under dispute', tone: 'danger', icon: '!' },
  COMPLETED: { label: 'Completed', tone: 'success', icon: '✓' },
  EXPIRED: { label: 'Expired', tone: 'neutral', icon: '×' },
}

export const milestoneStatus: Record<MilestoneStatus, StatusMeta> = {
  PENDING: { label: 'Not started', tone: 'neutral', icon: '○' },
  IN_PROGRESS: { label: 'In progress', tone: 'info', icon: '→' },
  SUBMITTED: { label: 'Submitted, checking', tone: 'info', icon: '⟳' },
  NEEDS_REVIEW: { label: 'Needs human review', tone: 'warning', icon: '?' },
  RELEASABLE: { label: 'Ready to release', tone: 'success', icon: '✓' },
  PAID: { label: 'Paid', tone: 'success', icon: '✓' },
  FAILED: { label: 'Failed', tone: 'danger', icon: '!' },
}

export const outcomeState: Record<OutcomeState, StatusMeta> = {
  VERIFIED: { label: 'Verified', tone: 'success', icon: '✓' },
  AWAITING_EVIDENCE: { label: 'Awaiting evidence', tone: 'neutral', icon: '…' },
  NEEDS_HUMAN_REVIEW: { label: 'Needs human review', tone: 'warning', icon: '?' },
  FAILED: { label: 'Failed', tone: 'danger', icon: '!' },
  DISPUTED: { label: 'Disputed', tone: 'danger', icon: '!' },
}

export const formatNaira = (amount: number): string => `₦${amount.toLocaleString('en-NG')}`
