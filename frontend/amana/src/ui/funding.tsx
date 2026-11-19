import { useEffect, useState } from 'react'
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


/**
 * After "I have made the transfer" we wait for Paga to confirm. A spinner that
 * never resolves is the worst possible answer: a buyer who mistyped the amount,
 * or never actually sent it, deserves to be told rather than left watching.
 */
export function PaymentWaiting({ onBack }: { onBack?: () => void }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Bank transfers usually land in seconds, and our reconciler re-checks every
  // minute, so past ninety seconds something is probably wrong.
  const slow = seconds > 90

  return (
    <Card title={slow ? 'We have not seen your transfer yet' : 'Checking for your payment'}>
      {!slow && (
        <p className="flex items-center gap-3 text-sm text-muted">
          <span
            aria-hidden="true"
            className="inline-block size-4 animate-spin rounded-full border-2 border-brand border-r-transparent"
          />
          Confirming with the payment provider. This usually takes a few seconds.
        </p>
      )}

      {slow && (
        <>
          <p className="text-sm leading-relaxed text-muted">
            Transfers normally arrive within a minute. If yours has not, one of these is usually why:
          </p>
          <ul className="m-0 grid list-none gap-2 p-0 text-sm">
            {[
              'The amount sent did not match the amount shown, even by one naira.',
              'The transfer went to a different account number.',
              'Your bank is still processing it — give it a few more minutes.',
            ].map((reason) => (
              <li key={reason} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted" />
                <span className="text-muted">{reason}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed">
            Nothing is lost either way. Money that does not match an order is never counted as paid, and we keep
            checking in the background.
          </p>
          {onBack && (
            <Button block onClick={onBack}>
              Check the account details again
            </Button>
          )}
        </>
      )}

      <p className="text-center text-xs text-muted">
        You can leave this page. We will notify you when funding is confirmed.
      </p>
    </Card>
  )
}
