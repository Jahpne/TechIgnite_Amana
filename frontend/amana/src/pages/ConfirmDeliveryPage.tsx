import type { ApiAgreementStatus } from '../api/types'
import { useConfirmAgreement } from '../hooks/actions'
import { errorMessage } from '../hooks/errors'
import { usePolledAgreement } from '../hooks/agreements'
import { ConfirmDelivery } from '../screens/trade/ConfirmDelivery'
import { Banner, ErrorState, LoadingState } from '../ui'

const WAITING: readonly ApiAgreementStatus[] = ['RELEASABLE', 'PAYING_OUT']

// S5. The buyer confirms receipt (this releases the payout once) or reports a problem.
// Photos are not sent: the backend has no file upload endpoint yet.
export function ConfirmDeliveryPage({ id }: { id: string }) {
  const a = usePolledAgreement(id, WAITING)
  const confirm = useConfirmAgreement(id)

  if (a.isPending) return <LoadingState label="Loading delivery…" />
  if (a.error || !a.view) {
    return <ErrorState message={errorMessage(a.error)} onRetry={() => void a.refetch()} />
  }
  if (a.role !== 'buyer' && a.role !== 'client') {
    return <ErrorState title="Only the buyer can do this" message="Confirming delivery is the buyer's step." />
  }

  return (
    <div className="grid gap-4">
      {confirm.error && (
        <Banner tone="danger" title="That did not work">
          {errorMessage(confirm.error)}
        </Banner>
      )}
      <ConfirmDelivery
        key={a.view.status}
        agreement={a.view}
        actionLoading={confirm.isPending}
        onConfirm={() => confirm.mutate({ outcome: 'CONFIRM' })}
        onReport={(payload) => confirm.mutate({ outcome: 'PROBLEM', note: payload.reason })}
      />
    </div>
  )
}
