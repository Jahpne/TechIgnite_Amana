import { Button, Card } from './primitives'
import { formatNaira } from './status'

export interface FundingAccount {
  accountNumber: string
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
        Transfer exactly this amount to the account below from your bank app. Amana confirms the payment with the
        payment provider before the money counts as held.
      </p>
      <dl className="grid gap-2 rounded-lg border border-line bg-surface-2 p-3">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-sm text-muted">Amount</dt>
          <dd className="text-xl font-extrabold tabular-nums">{formatNaira(funding.amount)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-sm text-muted">Account number</dt>
          <dd className="font-mono text-lg font-bold tracking-wider">{funding.accountNumber}</dd>
        </div>
      </dl>
      <Button variant="primary" block loading={loading} onClick={onPaid}>
        I have made the transfer
      </Button>
      <p className="text-xs text-muted">Pressing this does not confirm anything. We check with the payment provider.</p>
    </Card>
  )
}
