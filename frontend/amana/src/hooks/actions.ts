import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listOpenDisputes, ruleDispute } from "../api/admin";
import {
  approveAgreement,
  compileAgreement,
  confirmAgreement,
  createMilestoneAgreement,
  createPurchase,
  createTrade,
  openDispute,
  patchTerms,
  startDelivery,
} from "../api/agreements";
import { approveMilestone, rejectMilestone, submitMilestoneEvidence } from "../api/milestones";
import type {
  CompileInput,
  ConfirmInput,
  CreateMilestoneAgreementInput,
  CreatePurchaseInput,
  CreateTradeInput,
  DisputeInput,
  MilestoneEvidenceInput,
  PatchTermsInput,
  RuleInput,
  StartDeliveryInput,
} from "../api/types";

// Every action refetches the agreement afterwards. We never guess the new status.
function useRefresh(agreementId?: string) {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["agreement", agreementId] }),
      qc.invalidateQueries({ queryKey: ["timeline", agreementId] }),
      qc.invalidateQueries({ queryKey: ["agreements"] }),
    ]);
}

export function useCreateTrade() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (b: CreateTradeInput) => createTrade(b), onSuccess: refresh });
}

export function useCreatePurchase() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (b: CreatePurchaseInput) => createPurchase(b), onSuccess: refresh });
}

export function useCreateMilestoneAgreement() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (b: CreateMilestoneAgreementInput) => createMilestoneAgreement(b),
    onSuccess: refresh,
  });
}

export function useCompileAgreement() {
  return useMutation({ mutationFn: (b: CompileInput) => compileAgreement(b) });
}

export function useApproveAgreement(id: string) {
  const refresh = useRefresh(id);
  return useMutation({ mutationFn: () => approveAgreement(id), onSuccess: refresh });
}

export function usePatchTerms(id: string) {
  const refresh = useRefresh(id);
  return useMutation({ mutationFn: (b: PatchTermsInput) => patchTerms(id, b), onSuccess: refresh });
}

export function useStartDelivery(id: string) {
  const refresh = useRefresh(id);
  return useMutation({ mutationFn: (b: StartDeliveryInput) => startDelivery(id, b), onSuccess: refresh });
}

export function useConfirmAgreement(id: string) {
  const refresh = useRefresh(id);
  return useMutation({ mutationFn: (b: ConfirmInput) => confirmAgreement(id, b), onSuccess: refresh });
}

export function useOpenDispute(id: string) {
  const refresh = useRefresh(id);
  return useMutation({ mutationFn: (b: DisputeInput) => openDispute(id, b), onSuccess: refresh });
}

export function useSubmitEvidence(agreementId: string, milestoneId: string) {
  const refresh = useRefresh(agreementId);
  return useMutation({
    mutationFn: (b: MilestoneEvidenceInput) => submitMilestoneEvidence(milestoneId, b),
    onSuccess: refresh,
  });
}

export function useApproveMilestone(agreementId: string, milestoneId: string) {
  const refresh = useRefresh(agreementId);
  return useMutation({ mutationFn: () => approveMilestone(milestoneId), onSuccess: refresh });
}

export function useRejectMilestone(agreementId: string, milestoneId: string) {
  const refresh = useRefresh(agreementId);
  return useMutation({ mutationFn: (reason: string) => rejectMilestone(milestoneId, reason), onSuccess: refresh });
}

// ---------------------------------------------------------------- admin

export function useOpenDisputes() {
  return useQuery({ queryKey: ["admin", "disputes"], queryFn: listOpenDisputes });
}

export function useRuleDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: RuleInput }) => ruleDispute(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "disputes"] }),
  });
}
