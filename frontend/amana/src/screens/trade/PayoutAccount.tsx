import { useState } from 'react'
import type { Bank, VerifiedAccount } from '../../api/payments'
import { Banner, Button, Card, PageTitle, TextField } from '../../ui'

export interface PayoutAccountProps {
  banks: Bank[]
  loadingBanks?: boolean
  /** Already saved, if any. */
  saved?: { accountName: string }
  /** Set once the bank has confirmed the account, before it is saved. */
  verified?: VerifiedAccount
  verifying?: boolean
  error?: string
  onVerify: (bankUuid: string, accountNumber: string) => void
  onConfirm: () => void
  onStartOver: () => void
  onDone?: () => void
}

/**
 * Where a seller gets paid. Money leaves by bank transfer, so a phone number
 * and an email are not enough.
 *
 * The confirmation step is the point of the screen: we show the name the bank
 * holds for the account and make a person recognise it. Paying the wrong
 * account cannot be undone.
 */
export function PayoutAccount(p: PayoutAccountProps) {
  const [bankUuid, setBankUuid] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  const digitsOnly = accountNumber.replace(/\D/g, '')
  const canVerify = bankUuid !== '' && digitsOnly.length === 10 && !p.verifying

  if (p.verified) {
    const bank = p.banks.find((b) => b.uuid === p.verified!.bankUuid)
    return (
      <div className="grid gap-5">
        <PageTitle title="Is this you?" subtitle="This is the name your bank holds for that account." />
        <Card>
          <div className="grid gap-1 rounded-xl border border-line bg-surface-2 p-4 text-center">
            <span className="font-display text-xl font-extrabold break-words">{p.verified.accountName}</span>
            <span className="text-sm text-muted">
              {bank?.name ?? 'Your bank'} · {p.verified.accountNumber}
            </span>
          </div>
          <Button variant="primary" block onClick={p.onConfirm}>
            Yes, pay me here
          </Button>
          <Button block onClick={p.onStartOver}>
            No, use a different account
          </Button>
          <p className="text-xs leading-relaxed text-muted">
            Check the name carefully. Money sent to the wrong account cannot be recovered.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-5">
      <PageTitle
        title="Where should we pay you?"
        subtitle="When a buyer confirms delivery, your money is transferred to this account."
      />

      {p.saved && (
        <Banner tone="success" title="You already have an account saved">
          Payouts go to {p.saved.accountName}. Adding a new one replaces it.
        </Banner>
      )}

      {p.error && (
        <Banner tone="danger" title="We could not verify that account">
          {p.error}
        </Banner>
      )}

      <Card>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (canVerify) p.onVerify(bankUuid, digitsOnly)
          }}
        >
          <div className="grid gap-1.5">
            <label htmlFor="bank" className="text-sm font-bold">
              Bank
            </label>
            <select
              id="bank"
              value={bankUuid}
              disabled={p.loadingBanks}
              onChange={(e) => setBankUuid(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-line-strong bg-surface px-3.5 py-3 text-ink transition-colors hover:border-brand-ring focus:border-brand"
            >
              <option value="">{p.loadingBanks ? 'Loading banks…' : 'Choose your bank'}</option>
              {p.banks.map((b) => (
                <option key={b.uuid} value={b.uuid}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <TextField
            label="Account number"
            inputMode="numeric"
            placeholder="0123456789"
            hint="10 digits, as it appears on your bank app."
            value={accountNumber}
            onChange={(v) => setAccountNumber(v.replace(/\D/g, '').slice(0, 10))}
          />

          <Button variant="primary" block type="submit" loading={p.verifying} disabled={!canVerify}>
            Check this account
          </Button>
        </form>
        <p className="text-xs leading-relaxed text-muted">
          We ask your bank to confirm the account and show you the name on it before saving anything.
        </p>
      </Card>

      {p.onDone && (
        <Button block onClick={p.onDone}>
          I will do this later
        </Button>
      )}
    </div>
  )
}
