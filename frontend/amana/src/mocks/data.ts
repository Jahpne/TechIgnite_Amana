// Mock data for UI development. Money is whole naira (integers).
import type {
  AgreementStatus,
  AgreementView,
  EvidenceEntry,
  Milestone,
  NextAction,
  TimelineEntry,
} from '../ui/types'

const seller = { name: 'Tunde Adebayo', phone: '0803 555 0142' }
const buyer = { name: 'Chioma Okafor', phone: '0802 555 0198' }

const ORDER_TOTAL = 180000
const ORDER_TERMS = 'Delivered by Chowdeck within Lagos. Buyer confirms receipt before payment is released.'

const tradeTimeline: Record<AgreementStatus, TimelineEntry[]> = {
  DRAFT: [{ id: 't1', actor: 'Tunde', action: 'created the order', at: '14 Nov, 09:02' }],
  AWAITING_ACCEPTANCE: [{ id: 't1', actor: 'Tunde', action: 'created the order', at: '14 Nov, 09:02' }],
  AWAITING_PAYMENT: [
    { id: 't1', actor: 'Tunde', action: 'created the order', at: '14 Nov, 09:02' },
    { id: 't2', actor: 'Chioma', action: 'accepted the terms', at: '14 Nov, 09:10' },
  ],
  PAYMENT_PENDING: [
    { id: 't1', actor: 'Tunde', action: 'created the order', at: '14 Nov, 09:02' },
    { id: 't2', actor: 'Chioma', action: 'accepted the terms', at: '14 Nov, 09:10' },
    { id: 't3', actor: 'Chioma', action: 'returned from Paga, payment being verified', at: '14 Nov, 09:14' },
  ],
  FUNDED: [
    { id: 't1', actor: 'Tunde', action: 'created the order', at: '14 Nov, 09:02' },
    { id: 't2', actor: 'Chioma', action: 'accepted the terms', at: '14 Nov, 09:10' },
    { id: 't3', actor: 'Amana', action: 'confirmed payment with Paga and is holding ₦180,000', at: '14 Nov, 09:14', evidence: 'PAGA-REF-48213' },
  ],
  IN_DELIVERY: [
    { id: 't1', actor: 'Tunde', action: 'created the order', at: '14 Nov, 09:02' },
    { id: 't2', actor: 'Chioma', action: 'accepted the terms', at: '14 Nov, 09:10' },
    { id: 't3', actor: 'Amana', action: 'confirmed payment with Paga and is holding ₦180,000', at: '14 Nov, 09:14', evidence: 'PAGA-REF-48213' },
    { id: 't4', actor: 'Tunde', action: 'handed the item to Chowdeck', at: '14 Nov, 11:30', evidence: 'CHW-77120' },
  ],
  DELIVERED: [
    { id: 't1', actor: 'Tunde', action: 'created the order', at: '14 Nov, 09:02' },
    { id: 't2', actor: 'Chioma', action: 'accepted the terms', at: '14 Nov, 09:10' },
    { id: 't3', actor: 'Amana', action: 'confirmed payment with Paga and is holding ₦180,000', at: '14 Nov, 09:14', evidence: 'PAGA-REF-48213' },
    { id: 't4', actor: 'Tunde', action: 'handed the item to Chowdeck', at: '14 Nov, 11:30', evidence: 'CHW-77120' },
    { id: 't5', actor: 'Chowdeck', action: 'reported the item as delivered', at: '14 Nov, 15:45', evidence: 'CHW-77120' },
  ],
  RELEASABLE: [
    { id: 't5', actor: 'Chowdeck', action: 'reported the item as delivered', at: '14 Nov, 15:45', evidence: 'CHW-77120' },
    { id: 't6', actor: 'Chioma', action: 'confirmed receipt', at: '14 Nov, 16:05' },
  ],
  PAYOUT_PENDING: [
    { id: 't6', actor: 'Chioma', action: 'confirmed receipt', at: '14 Nov, 16:05' },
    { id: 't7', actor: 'Amana', action: 'sent the payout request to Paga', at: '14 Nov, 16:05' },
  ],
  PAYOUT_FAILED: [
    { id: 't6', actor: 'Chioma', action: 'confirmed receipt', at: '14 Nov, 16:05' },
    { id: 't7', actor: 'Amana', action: 'payout failed and was flagged to an admin', at: '14 Nov, 16:09' },
  ],
  DISPUTED: [
    { id: 't1', actor: 'Tunde', action: 'created the order', at: '14 Nov, 09:02' },
    { id: 't2', actor: 'Chioma', action: 'accepted the terms', at: '14 Nov, 09:10' },
    { id: 't3', actor: 'Amana', action: 'confirmed payment with Paga and is holding ₦180,000', at: '14 Nov, 09:14', evidence: 'PAGA-REF-48213' },
    { id: 't4', actor: 'Tunde', action: 'handed the item to Chowdeck', at: '14 Nov, 11:30', evidence: 'CHW-77120' },
    { id: 't5', actor: 'Chowdeck', action: 'reported the item as delivered', at: '14 Nov, 15:45', evidence: 'CHW-77120' },
    { id: 't6', actor: 'Chioma', action: 'reported a problem: the box was empty', at: '14 Nov, 16:20' },
    { id: 't7', actor: 'Amana', action: 'locked the payout until an admin rules', at: '14 Nov, 16:20' },
  ],
  COMPLETED: [
    { id: 't1', actor: 'Tunde', action: 'created the order', at: '14 Nov, 09:02' },
    { id: 't2', actor: 'Chioma', action: 'accepted the terms', at: '14 Nov, 09:10' },
    { id: 't3', actor: 'Amana', action: 'confirmed payment with Paga and is holding ₦180,000', at: '14 Nov, 09:14', evidence: 'PAGA-REF-48213' },
    { id: 't4', actor: 'Tunde', action: 'handed the item to Chowdeck', at: '14 Nov, 11:30', evidence: 'CHW-77120' },
    { id: 't5', actor: 'Chowdeck', action: 'reported the item as delivered', at: '14 Nov, 15:45', evidence: 'CHW-77120' },
    { id: 't6', actor: 'Chioma', action: 'confirmed receipt', at: '14 Nov, 16:05' },
    { id: 't7', actor: 'Amana', action: 'paid ₦180,000 to Tunde', at: '14 Nov, 16:06', evidence: 'PAYOUT-90331' },
  ],
  EXPIRED: [
    { id: 't1', actor: 'Tunde', action: 'created the order', at: '14 Nov, 09:02' },
    { id: 't2', actor: 'Chioma', action: 'accepted the terms', at: '14 Nov, 09:10' },
    { id: 't3', actor: 'Amana', action: 'expired the order because it was not paid in time', at: '15 Nov, 09:10' },
  ],
}

const chowdeckPickup: EvidenceEntry = {
  id: 'e-ship',
  kind: 'chowdeck',
  title: 'Picked up by Chowdeck',
  detail: 'Delivery CHW-77120',
  at: '14 Nov, 11:40',
}
const chowdeckDelivered: EvidenceEntry = {
  id: 'e-del',
  kind: 'chowdeck',
  title: 'Delivered',
  detail: 'Signed for at the delivery address',
  at: '14 Nov, 15:45',
}
const buyerConfirm: EvidenceEntry = {
  id: 'e-confirm',
  kind: 'buyer_confirm',
  title: 'Buyer confirmed receipt',
  at: '14 Nov, 16:05',
}
const buyerProblem: EvidenceEntry = {
  id: 'e-problem',
  kind: 'upload',
  title: 'Photo: box was empty',
  detail: 'Reason: "The box had no phone inside."',
  at: '14 Nov, 16:20',
}

const tradeEvidence: Partial<Record<AgreementStatus, EvidenceEntry[]>> = {
  IN_DELIVERY: [chowdeckPickup],
  DELIVERED: [chowdeckPickup, chowdeckDelivered],
  RELEASABLE: [chowdeckPickup, chowdeckDelivered, buyerConfirm],
  COMPLETED: [chowdeckPickup, chowdeckDelivered, buyerConfirm],
  DISPUTED: [chowdeckPickup, chowdeckDelivered, buyerProblem],
}

export function makeTrade(status: AgreementStatus = 'AWAITING_PAYMENT'): AgreementView {
  return {
    id: `ord-${status.toLowerCase()}`,
    type: 'TRADE',
    title: 'Samsung phone',
    status,
    total: ORDER_TOTAL,
    currency: 'NGN',
    payer: { ...buyer, approvedVersion: status === 'DRAFT' ? undefined : 1 },
    payee: { ...seller, approvedVersion: 1 },
    version: 1,
    disputeLocked: status === 'DISPUTED',
    expiresAt: status === 'EXPIRED' ? undefined : '16 Nov, 09:10',
    createdVia: 'whatsapp',
    deliveryTerms: ORDER_TERMS,
    milestones: [],
    evidence: tradeEvidence[status] ?? [],
    timeline: tradeTimeline[status],
  }
}

export const tradeStatuses: AgreementStatus[] = [
  'AWAITING_PAYMENT',
  'PAYMENT_PENDING',
  'FUNDED',
  'IN_DELIVERY',
  'DELIVERED',
  'DISPUTED',
  'COMPLETED',
  'EXPIRED',
]

export const tradesByStatus: Record<string, AgreementView> = Object.fromEntries(
  tradeStatuses.map((s) => [s, makeTrade(s)]),
)

/** Mock next action for the signed-in user, by role and status. */
export function tradeNextAction(status: AgreementStatus, role: 'buyer' | 'seller'): NextAction {
  const buyerMap: Partial<Record<AgreementStatus, NextAction>> = {
    AWAITING_ACCEPTANCE: { label: 'Accept terms' },
    AWAITING_PAYMENT: { label: 'Pay ₦180,000 with Paga' },
    PAYMENT_PENDING: { label: '', waitingOn: 'payment confirmation from Paga' },
    FUNDED: { label: '', waitingOn: 'the seller to ship' },
    IN_DELIVERY: { label: '', waitingOn: 'Chowdeck to deliver' },
    DELIVERED: { label: 'Confirm receipt' },
    DISPUTED: { label: '', waitingOn: 'an admin ruling' },
    COMPLETED: { label: 'View receipt' },
  }
  const sellerMap: Partial<Record<AgreementStatus, NextAction>> = {
    AWAITING_PAYMENT: { label: '', waitingOn: 'the buyer to pay' },
    FUNDED: { label: 'Hand item to Chowdeck' },
    IN_DELIVERY: { label: '', waitingOn: 'Chowdeck to deliver' },
    DELIVERED: { label: '', waitingOn: 'the buyer to confirm' },
    DISPUTED: { label: '', waitingOn: 'an admin ruling' },
    COMPLETED: { label: 'View receipt' },
  }
  const map = role === 'buyer' ? buyerMap : sellerMap
  return map[status] ?? { label: '', waitingOn: 'the other party' }
}

// ---------------------------------------------------------------- milestone contract

const client = { name: 'Grace Eze', phone: '0805 555 0177' }
const freelancer = { name: 'David Mensah', phone: '0807 555 0123' }

export const milestoneHomepage: Milestone = {
  id: 'ms-1',
  title: 'Homepage completed',
  amount: 50000,
  status: 'SUBMITTED',
  verification: 'client_approval',
  aiSuggested: true,
  conditions: [{ key: 'client_approval', label: 'Client approval', met: false }],
}

export const milestoneDeploy: Milestone = {
  id: 'ms-2',
  title: 'Website deployed',
  amount: 50000,
  status: 'IN_PROGRESS',
  verification: 'automated_test',
  aiSuggested: true,
  conditions: [
    { key: 'tests_pass', label: 'Tests pass', met: false },
    { key: 'client_approval', label: 'Client approval', met: false },
  ],
}

export const contractEvidence: EvidenceEntry[] = [
  {
    id: 'e-gh',
    kind: 'github',
    title: 'Pull request #12: Homepage',
    detail: 'github.com/david-mensah/grace-site/pull/12. CI: 14 of 14 checks passed.',
    at: '16 Nov, 10:20',
  },
  {
    id: 'e-shot',
    kind: 'upload',
    title: 'Screenshot: homepage on mobile',
    detail: 'homepage-mobile.png',
    at: '16 Nov, 10:22',
  },
]

export const milestoneContract: AgreementView = {
  id: 'con-001',
  type: 'MILESTONE',
  title: 'Website for Grace Eze',
  status: 'FUNDED',
  total: 100000,
  currency: 'NGN',
  payer: { ...client, approvedVersion: 1 },
  payee: { ...freelancer, approvedVersion: 1 },
  version: 1,
  disputeLocked: false,
  createdVia: 'web',
  milestones: [milestoneHomepage, milestoneDeploy],
  evidence: contractEvidence,
  timeline: [
    { id: 'c1', actor: 'Grace', action: 'described the project', at: '15 Nov, 08:00' },
    { id: 'c2', actor: 'AI', action: 'suggested 2 milestones totalling ₦100,000', at: '15 Nov, 08:01' },
    { id: 'c3', actor: 'Grace', action: 'approved version 1', at: '15 Nov, 08:12' },
    { id: 'c4', actor: 'David', action: 'approved version 1', at: '15 Nov, 08:30' },
    { id: 'c5', actor: 'Amana', action: 'confirmed payment with Paga and is holding ₦100,000', at: '15 Nov, 09:00', evidence: 'PAGA-REF-48390' },
    { id: 'c6', actor: 'David', action: 'submitted evidence for "Homepage completed"', at: '16 Nov, 10:22', evidence: 'PR #12' },
  ],
}

// ---------------------------------------------------------------- my agreements

export interface AgreementRow {
  id: string
  title: string
  counterparty: string
  amount: number
  status: AgreementStatus
  nextActionLabel: string
  needsMyAction: boolean
}

export const agreementRows: AgreementRow[] = [
  { id: 'ord-delivered', title: 'Samsung phone', counterparty: 'Tunde Adebayo', amount: 180000, status: 'DELIVERED', nextActionLabel: 'Confirm receipt', needsMyAction: true },
  { id: 'con-001', title: 'Website for Grace Eze', counterparty: 'David Mensah', amount: 100000, status: 'FUNDED', nextActionLabel: 'Review milestone 1', needsMyAction: true },
  { id: 'ord-awaiting_payment', title: 'Laptop bag', counterparty: 'Ngozi Bello', amount: 25000, status: 'AWAITING_PAYMENT', nextActionLabel: 'Pay with Paga', needsMyAction: true },
  { id: 'ord-in_delivery', title: 'Wireless earbuds', counterparty: 'Sade Ogunleye', amount: 42500, status: 'IN_DELIVERY', nextActionLabel: 'Waiting for Chowdeck', needsMyAction: false },
  { id: 'ord-disputed', title: 'Samsung phone', counterparty: 'Tunde Adebayo', amount: 180000, status: 'DISPUTED', nextActionLabel: 'Waiting for admin ruling', needsMyAction: false },
  { id: 'ord-completed', title: 'Office chair', counterparty: 'Ife Balogun', amount: 65000, status: 'COMPLETED', nextActionLabel: 'View receipt', needsMyAction: false },
  { id: 'ord-expired', title: 'Standing desk', counterparty: 'Kunle Adeyemi', amount: 90000, status: 'EXPIRED', nextActionLabel: 'No action', needsMyAction: false },
]

// ---------------------------------------------------------------- admin disputes

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

export const adminDisputes: AdminDispute[] = [
  {
    id: 'dis-101',
    agreementId: 'ord-disputed',
    title: 'Samsung phone',
    amount: 180000,
    openedAt: '14 Nov, 16:20',
    reason: 'Item not as described: box was empty.',
    status: 'OPEN',
    buyerSide: {
      party: 'Chioma Okafor',
      role: 'Buyer',
      statement: 'Chowdeck delivered a sealed box, but there was no phone inside when I opened it.',
      evidence: [buyerProblem],
    },
    sellerSide: {
      party: 'Tunde Adebayo',
      role: 'Seller',
      statement: 'I packed the phone myself and handed it over sealed. Here is the pickup record.',
      evidence: [chowdeckPickup, chowdeckDelivered],
    },
  },
  {
    id: 'dis-102',
    agreementId: 'con-002',
    title: 'Logo design, milestone 2',
    amount: 30000,
    openedAt: '16 Nov, 12:05',
    reason: 'Client rejected the milestone after tests passed.',
    status: 'OPEN',
    buyerSide: {
      party: 'Grace Eze',
      role: 'Client',
      statement: 'The final files do not match the agreed brand colours.',
      evidence: [
        { id: 'd2-b1', kind: 'upload', title: 'Brand guide comparison', detail: 'colour-mismatch.png', at: '16 Nov, 12:10' },
      ],
    },
    sellerSide: {
      party: 'David Mensah',
      role: 'Freelancer',
      statement: 'All delivery checks passed and the files follow the guide I was sent.',
      evidence: [
        { id: 'd2-s1', kind: 'github', title: 'Pull request #15: Logo assets', detail: 'CI: all checks passed.', at: '16 Nov, 11:40' },
      ],
    },
  },
]

// ---------------------------------------------------------------- receipt

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

export const receipt: Receipt = {
  agreementId: 'ord-completed',
  title: 'Samsung phone',
  amount: ORDER_TOTAL,
  payer: 'Chioma Okafor',
  payee: 'Tunde Adebayo',
  pagaReference: 'PAGA-REF-48213',
  payoutReference: 'PAYOUT-90331',
  completedAt: '14 Nov, 16:06',
  events: tradeTimeline.COMPLETED,
}
