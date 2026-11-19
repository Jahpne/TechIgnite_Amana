import { http } from "./client";
import type { ApiPaymentStatus } from "./types";

/** Funding and payout status, with the held balance. Poll this while waiting for funding. */
export const getPaymentStatus = (agreementId: string) =>
  http.get<ApiPaymentStatus>(`/payments/${agreementId}`).then((r) => r.data);

/** Creates the funding account for an agreement. The amount comes from the agreement, never from here. */
export const createCollection = (agreementId: string) =>
  http.post("/payments/collections", { agreementId }).then((r) => r.data);

// POST /payouts and /webhooks/* are backend-only. The web app never calls them.

// ---------------------------------------------------------------- payouts

export interface Bank {
  uuid: string;
  name: string;
}

export interface PayoutReadiness {
  ready: boolean;
  /** The name the bank holds for the saved account. */
  accountName?: string;
}

export interface VerifiedAccount {
  accountName: string;
  bankUuid: string;
  accountNumber: string;
}

/** Banks a payout can be sent to. */
export const getBanks = () => http.get<Bank[]>("/payouts/banks").then((r) => r.data);

/** Whether the signed-in user can be paid yet. */
export const getPayoutAccount = () =>
  http.get<PayoutReadiness>("/payouts/account").then((r) => r.data);

/**
 * Verifies the account with the bank and saves it. The returned accountName is
 * what the bank holds — show it and make the user confirm before relying on it.
 */
export const savePayoutAccount = (bankUuid: string, accountNumber: string) =>
  http.put<VerifiedAccount>("/payouts/account", { bankUuid, accountNumber }).then((r) => r.data);
