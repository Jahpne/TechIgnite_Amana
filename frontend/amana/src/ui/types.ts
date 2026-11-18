// View types used by presentational components.
// The logic layer maps API responses (generated from the OpenAPI spec) onto these.

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'ai'

export type Role = 'buyer' | 'seller' | 'client' | 'freelancer' | 'admin'

// Mirrors the backend's AgreementStatus enum (prisma/schema.prisma in amana-backend).
export type AgreementStatus =
  | 'DRAFT'
  | 'AWAITING_PAYMENT'
  | 'FUNDED'
  | 'IN_PROGRESS'
  | 'EVIDENCE_IN'
  | 'RELEASABLE'
  | 'PAYING_OUT'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'REFUNDED'
  | 'EXPIRED'

// Mirrors the backend's MilestoneStatus enum.
export type MilestoneStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'RELEASABLE'
  | 'PAYING_OUT'
  | 'PAID'
  | 'REJECTED'
  | 'DISPUTED'

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
  /** Backend key, for example "confirm_receipt". Screens may switch on it. */
  key?: string
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

// ---------------------------------------------------------------- list, admin and receipt views

export interface AgreementRow {
  id: string
  title: string
  counterparty: string
  amount: number
  status: AgreementStatus
  nextActionLabel: string
  needsMyAction: boolean
}

export interface DisputeSide {
  party: string
  role: string
  statement: string
  evidence: EvidenceEntry[]
}

export interface AdminDispute {
  id: string
  agreementId: string
  title: string
  amount: number
  openedAt: string
  reason: string
  status: 'OPEN' | 'RULED'
  buyerSide: DisputeSide
  sellerSide: DisputeSide
}

export interface Receipt {
  agreementId: string
  title: string
  amount: number
  payer: string
  payee: string
  pagaReference: string
  payoutReference: string
  completedAt: string
  events: TimelineEntry[]
}
