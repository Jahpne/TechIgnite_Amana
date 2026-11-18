// Turns backend responses (src/api/types.ts) into the shapes the screens use (src/ui/types.ts).
// Keep every backend-to-UI difference in this file, so a backend change never touches a screen.
// These functions are pure: no fetching, no side effects.

import type {
  AdminDispute,
  AgreementRow,
  AgreementView,
  DisputeSide,
  EvidenceEntry,
  Milestone,
  NextAction,
  Party,
  Receipt,
  Role,
  TimelineEntry,
} from "../ui/types";
import type { ApiUser } from "./auth";
import type {
  ApiAdminDispute,
  ApiAgreement,
  ApiAgreementBase,
  ApiAuditEntry,
  ApiEvidence,
  ApiMilestone,
  ApiNextAction,
} from "./types";

// ------------------------------------------------------------------ small helpers

/** Kobo string (for example "18000000") to naira (180000). The UI shows naira. */
export function koboToNaira(kobo: string): number {
  return Number(BigInt(kobo)) / 100;
}

/** Naira from a form (for example 180000) to the integer kobo the backend expects. */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function humanize(text: string): string {
  // Backend actions look like "terms.approved:payer" or "dispute.ruled:release".
  const spaced = text.replace(/[._]+/g, " ").replace(/:/g, ": ").trim();
  return spaced.charAt(0).toLowerCase() + spaced.slice(1);
}

function displayName(user: ApiUser): string {
  return user.name?.trim() || user.phone;
}

// ------------------------------------------------------------------ roles

/** The signed-in user's role as the screens name it. Null for someone who is not a party. */
export function toUiRole(a: Pick<ApiAgreement, "viewerRole" | "type">): Role | null {
  if (a.viewerRole === "observer") return null;
  if (a.type === "TRADE") return a.viewerRole === "payer" ? "buyer" : "seller";
  return a.viewerRole === "payer" ? "client" : "freelancer";
}

function partyLabel(actor: "payer" | "payee", type: ApiAgreementBase["type"]): string {
  if (actor === "payer") return type === "TRADE" ? "the buyer" : "the client";
  return type === "TRADE" ? "the seller" : "the freelancer";
}

// ------------------------------------------------------------------ next action

const WAITING_BY_KEY: Record<string, string> = {
  await_delivery: "Chowdeck to deliver",
  await_payout: "the payout to finish",
  await_admin_ruling: "an admin ruling",
};

/**
 * Backend nextAction ({ key, label, actor, isYours }) to the UI's { label, waitingOn }.
 * When isYours is true we show a button. Otherwise we show who we are waiting for.
 */
export function toNextAction(a: ApiAgreement): NextAction {
  const n: ApiNextAction = a.nextAction;

  if (n.key === "none") return { key: n.key, label: "Back to my agreements" };

  // The backend marks approve_terms as yours for both parties, even after you approved.
  if (n.key === "approve_terms") {
    const iApproved = a.viewerRole === "payer" ? a.approvals.payer : a.approvals.payee;
    if (iApproved) return { key: n.key, label: n.label, waitingOn: "the other party to approve" };
  }

  if (n.isYours) return { key: n.key, label: n.label };

  const waitingOn =
    WAITING_BY_KEY[n.key] ??
    (n.actor === "payer" || n.actor === "payee"
      ? partyLabel(n.actor, a.type)
      : n.actor === "admin"
        ? "an admin"
        : n.actor === "both"
          ? "both parties"
          : "the other party");
  return { key: n.key, label: n.label, waitingOn };
}

// ------------------------------------------------------------------ milestones and evidence

const CONDITION_LABELS: Record<string, string> = {
  tests_pass: "Tests pass",
  client_approval: "Client approval",
  evidence_submitted: "Evidence submitted",
};

function toMilestone(m: ApiMilestone, evidence: ApiEvidence[], aiGenerated: boolean): Milestone {
  const hasEvidence = evidence.some((e) => e.milestoneId === m.id);
  const met = (key: string): boolean => {
    if (key === "tests_pass") return m.testsPassedAt !== null;
    if (key === "client_approval") return m.approvedAt !== null;
    if (key === "evidence_submitted") return hasEvidence;
    return false;
  };
  return {
    id: m.id,
    title: m.title,
    amount: koboToNaira(m.amount),
    status: m.status,
    verification: m.verification,
    aiSuggested: aiGenerated,
    conditions: m.conditionsJson.map((key) => ({
      key,
      label: CONDITION_LABELS[key] ?? humanize(key),
      met: met(key),
    })),
  };
}

const EVIDENCE_KIND: Record<ApiEvidence["type"], EvidenceEntry["kind"]> = {
  CHOWDECK: "chowdeck",
  GITHUB: "github",
  UPLOAD: "upload",
  BUYER_CONFIRM: "buyer_confirm",
  BUYER_PROBLEM: "upload",
  ADMIN_NOTE: "upload",
};

const EVIDENCE_TITLE: Record<ApiEvidence["type"], string> = {
  CHOWDECK: "Delivery update from Chowdeck",
  GITHUB: "GitHub pull request",
  UPLOAD: "Uploaded evidence",
  BUYER_CONFIRM: "Buyer confirmed receipt",
  BUYER_PROBLEM: "Buyer reported a problem",
  ADMIN_NOTE: "Note from an admin",
};

export function toEvidence(e: ApiEvidence): EvidenceEntry {
  const p = e.payloadJson;
  return {
    id: e.id,
    kind: EVIDENCE_KIND[e.type],
    title: EVIDENCE_TITLE[e.type],
    // The payload is free-form JSON, so pick the fields we know how to show.
    detail: str(p.note) ?? str(p.prUrl) ?? str(p.reason) ?? str(p.status),
    at: formatWhen(e.receivedAt),
  };
}

// ------------------------------------------------------------------ timeline

function actorName(actor: string, a: ApiAgreementBase): string {
  if (actor === a.payerId) return displayName(a.payer);
  if (actor === a.payeeId) return displayName(a.payee);
  if (actor === "system") return "Amana";
  if (actor === "paga") return "Paga";
  if (actor === "chowdeck") return "Chowdeck";
  if (actor === "github") return "GitHub";
  if (actor.startsWith("admin")) return "An admin";
  return "Someone";
}

/** Audit log rows (GET /agreements/:id/timeline) to timeline entries. Oldest first. */
export function toTimeline(entries: ApiAuditEntry[], a: ApiAgreementBase): TimelineEntry[] {
  return [...entries]
    .sort((x, y) => x.createdAt.localeCompare(y.createdAt))
    .map((e) => ({
      id: e.id,
      actor: actorName(e.actor, a),
      action: humanize(e.action),
      at: formatWhen(e.createdAt),
      evidence: e.evidenceRef ?? undefined,
    }));
}

// ------------------------------------------------------------------ agreement

function toParty(user: ApiUser, approvedAt: string | null | undefined, version: number): Party {
  return {
    name: displayName(user),
    phone: user.phone,
    approvedVersion: approvedAt ? version : undefined,
  };
}

/**
 * GET /agreements/:id to what the screens render.
 * The timeline comes from a separate endpoint, so pass it in (or leave it empty).
 */
export function toAgreementView(a: ApiAgreement, timeline: TimelineEntry[] = []): AgreementView {
  const current = a.terms[0];
  const version = current?.version ?? a.version;
  const aiGenerated = current?.aiGenerated ?? false;
  const deliveryTerms = str(current?.termsJson?.deliveryTerms);

  return {
    id: a.id,
    type: a.type,
    title: a.title,
    status: a.status,
    total: koboToNaira(a.totalAmount),
    currency: "NGN",
    payer: toParty(a.payer, a.approvals.payer, version),
    payee: toParty(a.payee, a.approvals.payee, version),
    version,
    disputeLocked: a.disputeLock,
    expiresAt: a.expiresAt ? formatWhen(a.expiresAt) : undefined,
    createdVia: a.createdVia === "WHATSAPP" ? "whatsapp" : "web",
    deliveryTerms,
    milestones: a.milestones.map((m) => toMilestone(m, a.evidence, aiGenerated)),
    evidence: a.evidence.map(toEvidence),
    timeline,
  };
}

/** The account the buyer pays into, once both parties have approved. Null until then. */
export function toFundingAccount(a: ApiAgreement): { accountNumber: string; amount: number } | null {
  const payment = a.payments.find((p) => p.virtualAccountNumber !== null);
  if (!payment || payment.virtualAccountNumber === null) return null;
  return { accountNumber: payment.virtualAccountNumber, amount: koboToNaira(payment.amount) };
}

// ------------------------------------------------------------------ list rows, receipt, admin

/** One row of "My agreements". The counterparty is whoever the signed-in user is not. */
export function toAgreementRow(a: ApiAgreement): AgreementRow {
  const other = a.viewerRole === "payer" ? a.payee : a.payer;
  const next = toNextAction(a);
  return {
    id: a.id,
    title: a.title,
    counterparty: displayName(other),
    amount: koboToNaira(a.totalAmount),
    status: a.status,
    nextActionLabel: next.waitingOn ? `Waiting for ${next.waitingOn}` : next.label,
    needsMyAction: a.nextAction.isYours && !next.waitingOn && a.nextAction.key !== "none",
  };
}

/** A receipt, built from the agreement, its payments and its audit log. There is no receipt endpoint. */
export function toReceipt(a: ApiAgreement, audit: ApiAuditEntry[]): Receipt {
  const payment = a.payments.find((p) => p.status === "CONFIRMED") ?? a.payments[0];
  const payout = a.payouts.find((p) => p.status === "SENT");
  const done = [...audit].reverse().find((e) => e.toStatus === "COMPLETED" || e.toStatus === "REFUNDED");
  return {
    agreementId: a.id,
    title: a.title,
    amount: koboToNaira(a.totalAmount),
    payer: displayName(a.payer),
    payee: displayName(a.payee),
    pagaReference: payment?.pagaReference ?? "Not available",
    payoutReference: payout?.id ?? "Not paid out yet",
    completedAt: done ? formatWhen(done.createdAt) : "In progress",
    events: toTimeline(audit, a),
  };
}

function disputeSide(
  user: ApiUser,
  role: string,
  openedByThisSide: boolean,
  reason: string,
  evidence: ApiEvidence[],
): DisputeSide {
  return {
    party: displayName(user),
    role,
    statement: openedByThisSide ? reason : "No statement submitted.",
    evidence: evidence.map(toEvidence),
  };
}

const PAYER_EVIDENCE: ApiEvidence["type"][] = ["BUYER_CONFIRM", "BUYER_PROBLEM"];

/** An admin dispute. Buyer-side evidence is what the buyer filed. The rest is shown on the seller side. */
export function toAdminDispute(d: ApiAdminDispute): AdminDispute {
  const a = d.agreement;
  const trade = a.type === "TRADE";
  const relevant = d.milestoneId ? a.evidence.filter((e) => e.milestoneId === d.milestoneId) : a.evidence;
  return {
    id: d.id,
    agreementId: d.agreementId,
    title: a.title,
    amount: koboToNaira(a.totalAmount),
    openedAt: formatWhen(d.createdAt),
    reason: d.reason,
    status: d.status === "OPEN" || d.status === "UNDER_REVIEW" ? "OPEN" : "RULED",
    buyerSide: disputeSide(
      a.payer,
      trade ? "Buyer" : "Client",
      d.openedBy === a.payerId,
      d.reason,
      relevant.filter((e) => PAYER_EVIDENCE.includes(e.type)),
    ),
    sellerSide: disputeSide(
      a.payee,
      trade ? "Seller" : "Freelancer",
      d.openedBy === a.payeeId,
      d.reason,
      relevant.filter((e) => !PAYER_EVIDENCE.includes(e.type)),
    ),
  };
}
