import { http } from "./client";
import type {
  ApiAgreement,
  ApiAgreementBase,
  ApiAgreementStatus,
  ApiAuditEntry,
  ApiCompileResult,
  CompileInput,
  ConfirmInput,
  CreateMilestoneAgreementInput,
  CreateTradeInput,
  DisputeInput,
  PatchTermsInput,
  StartDeliveryInput,
} from "./types";

// Every call here needs a signed-in user. The token is attached in client.ts.
// Amounts you SEND are integer kobo. Amounts you RECEIVE are kobo strings.

// ---------------------------------------------------------------- read

/** One agreement, with viewerRole, approvals and nextAction for the signed-in user. */
export const getAgreement = (id: string) =>
  http.get<ApiAgreement>(`/agreements/${id}`).then((r) => r.data);

/** My agreements, newest first. Pass a status to filter. */
export const listAgreements = (status?: ApiAgreementStatus) =>
  http.get<ApiAgreement[]>("/agreements", { params: { status } }).then((r) => r.data);

/** The append-only audit log. This is what the status timeline renders. */
export const getTimeline = (id: string) =>
  http.get<ApiAuditEntry[]>(`/agreements/${id}/timeline`).then((r) => r.data);

// ---------------------------------------------------------------- create

/** Seller creates a trade order. */
export const createTrade = (body: CreateTradeInput) =>
  http.post<ApiAgreementBase>("/agreements", body).then((r) => r.data);

/** Creates a milestone agreement, usually from compiled (and possibly edited) terms. */
export const createMilestoneAgreement = (body: CreateMilestoneAgreementInput) =>
  http.post<ApiAgreementBase>("/agreements/milestone", body).then((r) => r.data);

/** AI proposes milestones from plain text. Nothing is bound until both parties approve. */
export const compileAgreement = (body: CompileInput) =>
  http.post<ApiCompileResult>("/agreements/compile", body).then((r) => r.data);

// ---------------------------------------------------------------- actions
// After any of these, refetch the agreement. Do not guess the new status.

/** The signed-in party approves the current version of the terms. */
export const approveAgreement = (id: string) =>
  http.post(`/agreements/${id}/approve`).then((r) => r.data);

/** Edits the terms and creates a new version. Both parties must approve it again. */
export const patchTerms = (id: string, body: PatchTermsInput) =>
  http.patch(`/agreements/${id}/terms`, body).then((r) => r.data);

/** Seller hands the item to Chowdeck. */
export const startDelivery = (id: string, body: StartDeliveryInput) =>
  http.post(`/agreements/${id}/delivery`, body).then((r) => r.data);

/** Buyer confirms receipt (CONFIRM) or reports a problem (PROBLEM). Confirming fires the payout. */
export const confirmAgreement = (id: string, body: ConfirmInput) =>
  http.post(`/agreements/${id}/confirm`, body).then((r) => r.data);

/** Opens a dispute and locks the payout. */
export const openDispute = (id: string, body: DisputeInput) =>
  http.post(`/agreements/${id}/dispute`, body).then((r) => r.data);
