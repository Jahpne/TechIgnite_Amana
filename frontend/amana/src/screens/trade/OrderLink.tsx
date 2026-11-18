import { useState } from 'react'
import {
  Banner,
  Button,
  Card,
  ConfirmDialog,
  DisputeBanner,
  ErrorState,
  FundingInstructions,
  KeyValues,
  LoadingState,
  PageTitle,
  Spinner,
  StatusBadge,
  formatNaira,
} from '../../ui'
import type { AgreementView, FundingAccount } from '../../ui'

export interface OrderLinkProps {
  agreement: AgreementView
  loading?: boolean
  error?: string
  onRetry?: () => void
  actionLoading?: boolean
  /** True when payment verification is taking longer than expected. */
  verifyTimedOut?: boolean
  /** True while we are polling the backend after the buyer says they have paid. */
  verifying?: boolean
  /** The account to pay into. Present once both parties have approved. */
  funding?: FundingAccount | null
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
  verifying,
  funding,
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
            ['Status', <StatusBadge key="status" status={status} type={a.type} />],
          ]}
        />
      </Card>

      {status === 'DRAFT' && (
        <Card>
          <Button variant="primary" block loading={actionLoading} onClick={() => setConfirmOpen(true)}>
            Accept terms
          </Button>
          <p className="text-xs text-muted">You will be asked to verify your phone number first.</p>
        </Card>
      )}

      {status === 'AWAITING_PAYMENT' && !verifying && (
        <FundingInstructions funding={funding ?? null} loading={actionLoading} onPaid={onPay} />
      )}

      {status === 'AWAITING_PAYMENT' && verifying && (
        <Banner tone="info" title="Verifying payment">
          <span className="flex items-center gap-2">
            <Spinner /> We are confirming your payment with Paga.
          </span>
          {verifyTimedOut && (
            <span className="mt-1 block">Still verifying. You can leave this page. We will notify you.</span>
          )}
        </Banner>
      )}

      {(status === 'FUNDED' || status === 'IN_PROGRESS' || status === 'EVIDENCE_IN' || status === 'COMPLETED') && (
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
