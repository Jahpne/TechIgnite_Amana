import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { getAgreement, getTimeline, listAgreements } from "../api/agreements";
import { toAgreementView, toNextAction, toTimeline, toUiRole } from "../api/mappers";
import type { ApiAgreement, ApiAgreementStatus } from "../api/types";

const POLL_MS = 4000;

/**
 * One agreement for a screen: the view, the next action and the viewer's role.
 * Pass `waiting`: while the agreement is in one of those statuses it is refetched every few
 * seconds, because the backend changes it by itself (funding, delivery, payout).
 * Status always comes from the backend. Nothing here decides it.
 */
export function useAgreement(id: string, waiting: readonly ApiAgreementStatus[] = []) {
  const qc = useQueryClient();
  const poll = () => {
    const current = qc.getQueryData<ApiAgreement>(["agreement", id]);
    return current && waiting.includes(current.status) ? POLL_MS : false;
  };

  const agreement = useQuery({
    queryKey: ["agreement", id],
    queryFn: () => getAgreement(id),
    refetchInterval: poll,
  });
  const timeline = useQuery({
    queryKey: ["timeline", id],
    queryFn: () => getTimeline(id),
    refetchInterval: poll,
  });

  const raw = agreement.data;
  const view = useMemo(
    () => (raw ? toAgreementView(raw, toTimeline(timeline.data ?? [], raw)) : undefined),
    [raw, timeline.data],
  );

  return {
    raw,
    view,
    audit: timeline.data,
    nextAction: raw ? toNextAction(raw) : undefined,
    role: raw ? toUiRole(raw) : null,
    isPending: agreement.isPending,
    error: agreement.error,
    refetch: agreement.refetch,
  };
}

/** Same as useAgreement. The name says what the second argument is for. */
export const usePolledAgreement = useAgreement;

/** My agreements, newest first. */
export function useAgreements(status?: ApiAgreementStatus) {
  return useQuery({
    queryKey: ["agreements", status ?? "all"],
    queryFn: () => listAgreements(status),
  });
}
