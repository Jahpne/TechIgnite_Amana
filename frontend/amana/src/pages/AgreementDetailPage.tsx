import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { ApiAgreement, ApiAgreementStatus } from '../api/types'
import { useApproveAgreement, useStartDelivery } from '../hooks/actions'
import { errorMessage } from '../hooks/errors'
import { usePolledAgreement } from '../hooks/agreements'
import { AgreementDetail } from '../screens/trade/AgreementDetail'
import { Banner, ErrorState, LoadingState } from '../ui'

// Statuses the backend moves by itself (funding, delivery, payout), so we poll while we are in them.
const WAITING: readonly ApiAgreementStatus[] = ['AWAITING_PAYMENT', 'IN_PROGRESS', 'RELEASABLE', 'PAYING_OUT']

const text = (value: unknown): string | undefined => (typeof value === 'string' && value.trim() ? value : undefined)

function firstMilestone(a: ApiAgreement, statuses: string[]): string | undefined {
  return a.milestones.find((m) => statuses.includes(m.status))?.id
}

// S4. Shows the status and the one next step for the signed-in user. What the button does
// depends on the backend's nextAction.key. We never work out the next step from the status.
export function AgreementDetailPage({ id }: { id: string }) {
  const navigate = useNavigate()
  const a = usePolledAgreement(id, WAITING)
  const approve = useApproveAgreement(id)
  const deliver = useStartDelivery(id)
  const [localError, setLocalError] = useState<string>()

  if (a.isPending) return <LoadingState label="Loading agreement…" />
  if (a.error || !a.view || !a.raw || !a.nextAction) {
    return <ErrorState message={errorMessage(a.error)} onRetry={() => void a.refetch()} />
  }
  if (a.role === null) return <ErrorState title="No access" message="You are not a party to this agreement." />

  const raw = a.raw
  // The screen only knows buyer and seller. A client is the payer and a freelancer is the payee.
  const role = a.role === 'buyer' || a.role === 'client' ? 'buyer' : 'seller'

  const act = () => {
    setLocalError(undefined)
    switch (a.nextAction?.key) {
      case 'approve_terms':
        if (raw.type === 'TRADE') approve.mutate()
        else void navigate({ to: '/agreements/$id/terms', params: { id } })
        break
      case 'fund':
        if (raw.type === 'TRADE') void navigate({ to: '/o/$agreementId', params: { agreementId: id } })
        else void navigate({ to: '/agreements/$id/terms', params: { id } })
        break
      case 'hand_to_delivery': {
        const terms = raw.terms[0]?.termsJson
        const pickupAddress = text(terms?.pickupAddress)
        const dropoffAddress = text(terms?.dropoffAddress)
        if (!pickupAddress || !dropoffAddress) {
          setLocalError('This order has no pickup or drop-off address, so delivery cannot be requested.')
          return
        }
        deliver.mutate({ pickupAddress, dropoffAddress, itemDescription: raw.title })
        break
      }
      case 'submit_evidence': {
        const milestoneId = firstMilestone(raw, ['PENDING', 'IN_PROGRESS', 'REJECTED'])
        if (milestoneId) void navigate({ to: '/agreements/$id/milestones/$milestoneId/evidence', params: { id, milestoneId } })
        break
      }
      case 'confirm_receipt':
        void navigate({ to: '/agreements/$id/confirm', params: { id } })
        break
      case 'approve_milestone': {
        const milestoneId = firstMilestone(raw, ['SUBMITTED', 'VERIFIED'])
        if (milestoneId) void navigate({ to: '/agreements/$id/milestones/$milestoneId/review', params: { id, milestoneId } })
        break
      }
      case 'view_receipt':
        void navigate({ to: '/agreements/$id/receipt', params: { id } })
        break
      default:
        void navigate({ to: '/agreements' })
    }
  }

  const actionError = localError ?? (approve.error ? errorMessage(approve.error) : deliver.error ? errorMessage(deliver.error) : undefined)

  return (
    <div className="grid gap-4">
      {actionError && (
        <Banner tone="danger" title="That did not work">
          {actionError}
        </Banner>
      )}
      <AgreementDetail
        agreement={a.view}
        role={role}
        nextAction={a.nextAction}
        onAct={act}
        actionLoading={approve.isPending || deliver.isPending}
      />
    </div>
  )
}
