import { http } from "./client";
import type { MilestoneEvidenceInput } from "./types";

// Milestone calls. There is no "get one milestone" endpoint, so milestones are read from
// the agreement (getAgreement) and these calls only change them.

/** Freelancer submits evidence. Refetch the agreement afterwards. */
export const submitMilestoneEvidence = (milestoneId: string, body: MilestoneEvidenceInput) =>
  http.post(`/milestones/${milestoneId}/evidence`, body).then((r) => r.data);

/** Client approves a milestone. When all its conditions are met it pays out. */
export const approveMilestone = (milestoneId: string) =>
  http.post(`/milestones/${milestoneId}/approve`).then((r) => r.data);

/** Client rejects a milestone. The reason must be 3 to 500 characters. */
export const rejectMilestone = (milestoneId: string, reason: string) =>
  http.post(`/milestones/${milestoneId}/reject`, { reason }).then((r) => r.data);
