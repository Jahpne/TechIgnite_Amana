import { toReceipt } from '../api/mappers'
import { useAgreement } from '../hooks/agreements'
import { errorMessage } from '../hooks/errors'
import { Receipt } from '../screens/lists/Receipt'
import { Banner, ErrorState, LoadingState } from '../ui'

// S12. There is no receipt endpoint, so the receipt is built from the agreement and its audit log.
export function ReceiptPage({ id }: { id: string }) {
  const a = useAgreement(id)

  if (a.isPending) return <LoadingState label="Loading receipt…" />
  if (a.error || !a.raw) {
    return <ErrorState message={errorMessage(a.error)} onRetry={() => void a.refetch()} />
  }
  const done = a.raw.status === 'COMPLETED' || a.raw.status === 'REFUNDED'

  // A receipt only exists once the deal is over. Before that, say so instead of showing a half-empty one.
  if (!done) {
    return (
      <Banner tone="info" title="No receipt yet">
        A receipt is issued when this agreement is completed or refunded. Open the agreement to see where it stands.
      </Banner>
    )
  }

  return <Receipt receipt={toReceipt(a.raw, a.audit ?? [])} />
}
