// View types used by presentational components.
// The logic layer maps API responses (generated from the OpenAPI spec) onto these.

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'ai'

export type Role = 'buyer' | 'seller' | 'client' | 'freelancer' | 'admin'

export type AgreementStatus =
  | 'DRAFT'
  | 'AWAITING_ACCEPTANCE'
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_PENDING'
  | 'FUNDED'
  | 'IN_DELIVERY'
  | 'DELIVERED'
  | 'RELEASABLE'
  | 'PAYOUT_PENDING'
  | 'PAYOUT_FAILED'
  | 'DISPUTED'
  | 'COMPLETED'
  | 'EXPIRED'

export type MilestoneStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'NEEDS_REVIEW'
  | 'RELEASABLE'
  | 'PAID'
  | 'FAILED'

export type OutcomeState =
  | 'VERIFIED'
  | 'AWAITING_EVIDENCE'
  | 'NEEDS_HUMAN_REVIEW'
  | 'FAILED'
  | 'DISPUTED'

export interface Party {
  name: string
  phone: string
  approvedVersion?: number
}

export interface Condition {
  key: string
  label: string
  met: boolean
}

export interface Milestone {
  id: string
  title: string
  amount: number
  status: MilestoneStatus
  conditions: Condition[]
  verification: string
  aiSuggested?: boolean
}

export interface EvidenceEntry {
  id: string
  kind: 'chowdeck' | 'github' | 'upload' | 'buyer_confirm'
  title: string
  detail?: string
  at: string
}

export interface TimelineEntry {
  id: string
  actor: string
  action: string
  at: string
  evidence?: string
}

export interface NextAction {
  label: string
  waitingOn?: string
  tone?: 'primary' | 'danger'
}

export interface AgreementView {
  id: string
  type: 'TRADE' | 'MILESTONE'
  title: string
  status: AgreementStatus
  total: number
  currency: 'NGN'
  payer: Party
  payee: Party
  version: number
  disputeLocked: boolean
  expiresAt?: string
  createdVia: 'whatsapp' | 'web'
  deliveryTerms?: string
  milestones: Milestone[]
  evidence: EvidenceEntry[]
  timeline: TimelineEntry[]
}
