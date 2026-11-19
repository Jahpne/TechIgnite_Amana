import { Button, Card } from './primitives'
import { formatNaira } from './status'

export interface FundingAccount {
  accountNumber: string
  /** The name the payer will see when their bank resolves the account. */
  accountName: string
  bankName: string
  /** Whole naira. */
  amount: number
}

// The backend funds by bank transfer into an account created for this one agreement.
// Show the account and the exact amount, then wait for the backend to confirm.
export function FundingInstructions({
  funding,
  onPaid,
  loading,
}: {
  funding: FundingAccount | null
  onPaid: () => void
  loading?: boolean
}) {
  if (!funding) {
    return (
      <Card title="Payment">
        <p className="text-sm text-muted">
          The payment account is being prepared. This page updates by itself when it is ready.
        </p>
      </Card>
    )
  }
  return (
    <Card title="Pay by bank transfer">
      <p className="text-sm text-muted">
        Transfer exactly this amount to the account below from your bank app, choosing {'"'}{funding.bankName}{'"'} as
        the bank. Amana confirms the payment with the payment provider before the money counts as held.
      </p>
      <dl className="grid gap-2.5 rounded-xl border border-line bg-surface-2 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-sm text-muted">Amount</dt>
          <dd className="font-display text-2xl font-extrabold tabular-nums">{formatNaira(funding.amount)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-sm text-muted">Bank</dt>
          <dd className="font-bold">{funding.bankName}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-sm text-muted">Account number</dt>
          <dd className="font-mono text-lg font-bold tracking-wider tabular-nums">{funding.accountNumber}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="shrink-0 text-sm text-muted">Account name</dt>
          <dd className="text-right text-sm font-bold break-words">{funding.accountName}</dd>
        </div>
      </dl>
      <Button variant="primary" block loading={loading} onClick={onPaid}>
        I have made the transfer
      </Button>
      <p className="text-xs text-muted">Pressing this does not confirm anything. We check with the payment provider.</p>
    </Card>
  )
}
