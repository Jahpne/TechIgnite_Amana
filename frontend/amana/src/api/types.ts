// Response and request shapes for the Amana backend (amana-backend, openapi.yaml and the
// prisma schema). Money is minor units (kobo). The backend sends BigInt amounts as STRINGS
// and expects request amounts as plain INTEGERS.

import type { ApiUser } from "./auth";

export type ApiAgreementStatus =
  | "DRAFT"
  | "AWAITING_PAYMENT"
  | "FUNDED"
  | "IN_PROGRESS"
  | "EVIDENCE_IN"
  | "RELEASABLE"
  | "PAYING_OUT"
  | "COMPLETED"
  | "DISPUTED"
  | "REFUNDED"
  | "EXPIRED";

export type ApiMilestoneStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "VERIFIED"
  | "RELEASABLE"
  | "PAYING_OUT"
  | "PAID"
  | "REJECTED"
  | "DISPUTED";

export type ApiChannel = "WEB" | "WHATSAPP" | "API" | "DISCORD";

export type ApiEvidenceType =
  | "CHOWDECK"
  | "GITHUB"
  | "UPLOAD"
  | "BUYER_CONFIRM"
  | "BUYER_PROBLEM"
  | "ADMIN_NOTE";

export type ApiCondition = "tests_pass" | "client_approval" | "evidence_submitted";

// ------------------------------------------------------------------ agreement

export interface ApiMilestone {
  id: string;
  agreementId: string;
  position: number;
  title: string;
  /** Kobo, as a string. */
  amount: string;
  /** For example ["tests_pass", "client_approval"]. */
  conditionsJson: string[];
  verification: string;
  status: ApiMilestoneStatus;
  testsPassedAt: string | null;
  approvedAt: string | null;
}

export interface ApiTerms {
  version: number;
  termsJson: Record<string, unknown>;
  aiGenerated: boolean;
  approvedByPayerAt: string | null;
  approvedByPayeeAt: string | null;
}

export interface ApiEvidence {
  id: string;
  agreementId: string;
  milestoneId: string | null;
  type: ApiEvidenceType;
  payloadJson: Record<string, unknown>;
  source: string;
  receivedAt: string;
}

export interface ApiPayment {
  id: string;
  pagaReference: string;
  /** The account the buyer transfers into. Show it with the exact amount. */
  virtualAccountNumber: string | null;
  /** Kobo, as a string. */
  amount: string;
  currency: string;
  status: "PENDING" | "CONFIRMED" | "MISMATCHED" | "FAILED" | "EXPIRED";
  confirmedAt: string | null;
}

export interface ApiPayout {
  id: string;
  milestoneId: string | null;
  amount: string;
  status: "PENDING" | "SENT" | "FAILED" | "REVERSED";
  failureReason: string | null;
}

export interface ApiDelivery {
  id: string;
  chowdeckDeliveryId: string;
  status: "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED" | "RETURNED";
  trackingUrl: string | null;
  pickupAddress: string | null;
  dropoffAddress: string | null;
}

export interface ApiDispute {
  id: string;
  milestoneId: string | null;
  openedBy: string;
  reason: string;
  status: "OPEN" | "UNDER_REVIEW" | "RULED_RELEASE" | "RULED_REFUND";
  ruling: string | null;
  createdAt: string;
}

/** What create and some mutations return: the agreement and its relations. */
export interface ApiAgreementBase {
  id: string;
  type: "TRADE" | "MILESTONE";
  status: ApiAgreementStatus;
  payerId: string;
  payeeId: string;
  payer: ApiUser;
  payee: ApiUser;
  title: string;
  /** Kobo, as a string. */
  totalAmount: string;
  currency: string;
  version: number;
  disputeLock: boolean;
  createdVia: ApiChannel;
  autoReleaseHours: number | null;
  expiresAt: string | null;
  createdAt: string;
  /** Newest version first. */
  terms: ApiTerms[];
  milestones: ApiMilestone[];
  evidence: ApiEvidence[];
  deliveries: ApiDelivery[];
  disputes: ApiDispute[];
  payments: ApiPayment[];
  payouts: ApiPayout[];
}

export interface ApiNextAction {
  /** For example "confirm_receipt". Stable value to switch on. */
  key: string;
  label: string;
  actor: "payer" | "payee" | "both" | "admin" | "nobody";
  /** True when THIS user is the one who must act. */
  isYours: boolean;
}

/** What GET /agreements and GET /agreements/:id return: adds the viewer-specific fields. */
export interface ApiAgreement extends ApiAgreementBase {
  viewerRole: "payer" | "payee" | "observer";
  approvals: {
    payer: string | null;
    payee: string | null;
    bothApproved: boolean;
  };
  nextAction: ApiNextAction;
}

/** One row of the audit log (GET /agreements/:id/timeline). */
export interface ApiAuditEntry {
  id: string;
  agreementId: string;
  /** A user id, or "system", "paga", "chowdeck", "github", "admin:<id>". */
  actor: string;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  evidenceRef: string | null;
  createdAt: string;
}

// ------------------------------------------------------------------ compiler

export interface ApiCompiledMilestone {
  title: string;
  /** Kobo, as an integer. */
  amount: number;
  conditions: ApiCondition[];
  verification: "client_approval" | "automated_test" | "manual_review";
}

export interface ApiCompiledTerms {
  total_amount: number;
  currency: string;
  milestones: ApiCompiledMilestone[];
  required_approvals: ("payer" | "payee")[];
  dispute_terms: string;
}

export interface ApiCompileResult {
  terms: ApiCompiledTerms;
  source: string;
  /** Show this next to the AI-written terms ("suggested by AI, please review"). */
  disclaimer: string;
}

// ------------------------------------------------------------------ requests (amounts are INTEGER kobo)

export interface CreateTradeInput {
  title: string;
  amount: number;
  buyerPhone: string;
  currency?: string;
  deliveryTerms?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  createdVia?: ApiChannel;
  /** 1 to 168. */
  autoReleaseHours?: number;
}

export interface CreatePurchaseInput {
  title: string;
  amount: number;
  sellerPhone: string;
  currency?: string;
  deliveryTerms?: string;
  dropoffAddress?: string;
  /** Which Plug listing this came from. */
  listingRef?: string;
  createdVia?: ApiChannel;
  /** 1 to 168. */
  autoReleaseHours?: number;
}

export interface MilestoneInput {
  title: string;
  amount: number;
  /** At least one. */
  conditions: string[];
  verification?: string;
}

export interface CreateMilestoneAgreementInput {
  title: string;
  freelancerPhone: string;
  totalAmount: number;
  milestones: MilestoneInput[];
  currency?: string;
  disputeTerms?: string;
  aiGenerated?: boolean;
  createdVia?: ApiChannel;
}

export interface CompileInput {
  /** 10 to 4000 characters. */
  description: string;
  currency?: string;
  budgetAmount?: number;
}

export interface PatchTermsInput {
  totalAmount?: number;
  milestones?: MilestoneInput[];
  deliveryTerms?: string;
  disputeTerms?: string;
}

export interface StartDeliveryInput {
  pickupAddress: string;
  dropoffAddress: string;
  itemDescription: string;
}

export interface ConfirmInput {
  outcome: "CONFIRM" | "PROBLEM";
  note?: string;
}

export interface DisputeInput {
  /** 5 to 1000 characters. */
  reason: string;
  milestoneId?: string;
  evidenceUrl?: string;
}

// ------------------------------------------------------------------ payments, admin, milestones

export interface ApiPaymentStatus {
  payments: ApiPayment[];
  payouts: ApiPayout[];
  balance: { held: string; released: string; net: string };
}

/** GET /admin/disputes: an open dispute with the agreement and both sides' evidence attached. */
export interface ApiAdminDispute extends ApiDispute {
  agreementId: string;
  agreement: Pick<
    ApiAgreementBase,
    | "id"
    | "type"
    | "title"
    | "totalAmount"
    | "currency"
    | "payerId"
    | "payeeId"
    | "payer"
    | "payee"
    | "evidence"
    | "deliveries"
    | "milestones"
  >;
}

export interface MilestoneEvidenceInput {
  type?: "GITHUB" | "UPLOAD";
  prUrl?: string;
  /** Image URLs only. The backend has no file upload endpoint. */
  screenshots?: string[];
  note?: string;
}

export interface RuleInput {
  decision: "RELEASE" | "REFUND";
  /** 5 to 1000 characters. */
  reasoning: string;
}
