import { useEffect, useState } from 'react'
import {
  Banner,
  Button,
  Card,
  ConfirmDialog,
  DisputeBanner,
  ErrorState,
  KeyValues,
  LoadingState,
  PageTitle,
  Spinner,
  StatusBadge,
  formatNaira,
} from '../../ui'
import type { AgreementStatus, AgreementView } from '../../ui'
import { makeTrade } from '../../mocks/data'
import { PreviewPanel, SelectControl } from './controls'

export interface OrderLinkProps {
  agreement: AgreementView
  loading?: boolean
  error?: string
  onRetry?: () => void
  actionLoading?: boolean
  /** True when payment verification is taking longer than expected. */
  verifyTimedOut?: boolean
  onAccept: () => void
  onPay: () => void
}

export function OrderLink({
  agreement: a,
  loading,
  error,
  onRetry,
  actionLoading,
  verifyTimedOut,
  onAccept,
  onPay,
}: OrderLinkProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (loading) return <LoadingState label="Loading order…" />
  if (error) return <ErrorState title="We could not load this order" message={error} onRetry={onRetry} />

  const total = formatNaira(a.total)
  const status = a.status

  return (
    <div className="grid gap-4">
      <PageTitle title={a.title} subtitle={`Protected order from ${a.payee.name}`} />

      <Card title="Order terms">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">You pay</span>
          <span className="text-3xl font-extrabold tabular-nums">{total}</span>
        </div>
        <KeyValues
          items={[
            ['Seller', a.payee.name],
            ['Item', a.title],
            ['Delivery terms', a.deliveryTerms ?? 'Not specified'],
            ['Order expires', a.expiresAt ?? 'Expired'],
            ['Status', <StatusBadge key="status" status={status} />],
          ]}
        />
      </Card>

      {(status === 'DRAFT' || status === 'AWAITING_ACCEPTANCE') && (
        <Card>
          <Button variant="primary" block loading={actionLoading} onClick={() => setConfirmOpen(true)}>
            Accept terms
          </Button>
          <p className="text-xs text-muted">You will be asked to verify your phone number first.</p>
        </Card>
      )}

      {status === 'AWAITING_PAYMENT' && (
        <Card>
          <Button variant="primary" block loading={actionLoading} onClick={onPay}>
            Pay {total} with Paga
          </Button>
          <p className="text-xs text-muted">You will leave Amana to pay on Paga, then return to this page.</p>
        </Card>
      )}

      {status === 'PAYMENT_PENDING' && (
        <Banner tone="info" title="Verifying payment">
          <span className="flex items-center gap-2">
            <Spinner /> We are confirming your payment with Paga.
          </span>
          {verifyTimedOut && (
            <span className="mt-1 block">Still verifying. You can leave this page. We will notify you.</span>
          )}
        </Banner>
      )}

      {(status === 'FUNDED' || status === 'IN_DELIVERY' || status === 'DELIVERED' || status === 'COMPLETED') && (
        <Banner tone="success" title="Payment confirmed">
          {status === 'COMPLETED'
            ? 'This order is complete. The seller has been paid.'
            : 'Amana is holding your money. It is released to the seller only after you confirm delivery.'}
        </Banner>
      )}

      {status === 'EXPIRED' && (
        <Banner tone="warning" title="This order has expired">
          Ask the seller for a new order link.
        </Banner>
      )}

      {a.disputeLocked && <DisputeBanner />}

      <ConfirmDialog
        open={confirmOpen}
        title="Accept these terms?"
        confirmLabel="Accept terms"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          onAccept()
        }}
      >
        <p>
          You agree to pay <strong>{total}</strong> for {a.title}. Amana holds the payment and releases it to the
          seller only after you confirm delivery.
        </p>
      </ConfirmDialog>
    </div>
  )
}

type View = 'normal' | 'loading' | 'error'

const startOptions: { value: AgreementStatus; label: string }[] = [
  { value: 'AWAITING_ACCEPTANCE', label: 'Awaiting acceptance' },
  { value: 'AWAITING_PAYMENT', label: 'Awaiting payment' },
  { value: 'PAYMENT_PENDING', label: 'Verifying payment' },
  { value: 'FUNDED', label: 'Funded' },
  { value: 'DISPUTED', label: 'Disputed' },
  { value: 'EXPIRED', label: 'Expired' },
]

export function OrderLinkPreview() {
  const [status, setStatus] = useState<AgreementStatus>('AWAITING_ACCEPTANCE')
  const [view, setView] = useState<View>('normal')
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (status !== 'PAYMENT_PENDING' || slow) return
    const t = setTimeout(() => setStatus('FUNDED'), 2500)
    return () => clearTimeout(t)
  }, [status, slow])

  return (
    <div className="grid gap-4">
      <PreviewPanel>
        <SelectControl label="State" value={status} options={startOptions} onChange={setStatus} />
        <SelectControl
          label="View"
          value={view}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'loading', label: 'Loading' },
            { value: 'error', label: 'Error' },
          ]}
          onChange={setView}
        />
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} className="size-5" />
          Slow verification (shows the timeout message)
        </label>
      </PreviewPanel>
      <OrderLink
        agreement={makeTrade(status)}
        loading={view === 'loading'}
        error={view === 'error' ? 'The server did not respond. Check your connection and try again.' : undefined}
        onRetry={() => setView('normal')}
        verifyTimedOut={slow}
        onAccept={() => setStatus('AWAITING_PAYMENT')}
        onPay={() => setStatus('PAYMENT_PENDING')}
      />
    </div>
  )
}
