import { http } from "./client";
import type { ApiPaymentStatus } from "./types";

/** Funding and payout status, with the held balance. Poll this while waiting for funding. */
export const getPaymentStatus = (agreementId: string) =>
  http.get<ApiPaymentStatus>(`/payments/${agreementId}`).then((r) => r.data);

/** Creates the funding account for an agreement. The amount comes from the agreement, never from here. */
export const createCollection = (agreementId: string) =>
  http.post("/payments/collections", { agreementId }).then((r) => r.data);

// POST /payouts and /webhooks/* are backend-only. The web app never calls them.
