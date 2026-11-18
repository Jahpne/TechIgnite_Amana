import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toFundingAccount } from '../api/mappers'
import type { ApiAgreementStatus } from '../api/types'
import { useApproveAgreement } from '../hooks/actions'
import { errorMessage } from '../hooks/errors'
import { usePolledAgreement } from '../hooks/agreements'
import { OrderLink } from '../screens/trade/OrderLink'
import { Banner, ErrorState, LoadingState } from '../ui'

const WAITING: readonly ApiAgreementStatus[] = ['AWAITING_PAYMENT']
const VERIFY_TIMEOUT_MS = 60_000

// S2. The buyer opens this from the link. Funding is a bank transfer: we show the account,
// then poll the backend until it reports FUNDED. The client never marks anything paid.
export function OrderLinkPage({ id }: { id: string }) {
  const navigate = useNavigate()
  const a = usePolledAgreement(id, WAITING)
  const approve = useApproveAgreement(id)
  const [verifying, setVerifying] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  const status = a.raw?.status
  const viewerRole = a.raw?.viewerRole

  useEffect(() => {
    if (!verifying) return
    const t = setTimeout(() => setTimedOut(true), VERIFY_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [verifying])

  // The seller does not pay. Send them to the agreement page.
  useEffect(() => {
    if (viewerRole === 'payee') void navigate({ to: '/agreements/$id', params: { id } })
  }, [viewerRole, navigate, id])

  if (a.isPending) return <LoadingState label="Loading order…" />
  if (a.error || !a.view || !a.raw) {
    return <ErrorState title="We could not load this order" message={errorMessage(a.error)} onRetry={() => void a.refetch()} />
  }
  if (a.role === null) return <ErrorState title="No access" message="You are not a party to this order." />

  return (
    <div className="grid gap-4">
      {approve.error && (
        <Banner tone="danger" title="We could not accept the terms">
          {errorMessage(approve.error)}
        </Banner>
      )}
      <OrderLink
        agreement={a.view}
        funding={toFundingAccount(a.raw)}
        verifying={verifying && status === 'AWAITING_PAYMENT'}
        verifyTimedOut={timedOut}
        actionLoading={approve.isPending}
        onAccept={() => approve.mutate()}
        onPay={() => setVerifying(true)}
      />
    </div>
  )
}
