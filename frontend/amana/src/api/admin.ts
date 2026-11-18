import { http } from "./client";
import type { ApiAdminDispute, RuleInput } from "./types";

// Admin only. A normal user gets 403.

/** Open disputes with both sides' evidence. */
export const listOpenDisputes = () =>
  http.get<ApiAdminDispute[]>("/admin/disputes").then((r) => r.data);

/** A person rules RELEASE or REFUND. AI never rules. */
export const ruleDispute = (disputeId: string, body: RuleInput) =>
  http.post(`/admin/disputes/${disputeId}/rule`, body).then((r) => r.data);
