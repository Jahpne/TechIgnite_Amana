import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getBanks, getPayoutAccount, savePayoutAccount } from '../api/payments'
import type { VerifiedAccount } from '../api/payments'
import { errorMessage } from '../hooks/errors'
import { PayoutAccount } from '../screens/trade/PayoutAccount'
import { ErrorState, LoadingState } from '../ui'

/**
 * Verify, then save. The account is only stored after the user confirms the
 * name the bank returned, so a typo cannot quietly become where their money
 * goes.
 */
export function PayoutAccountPage({ next }: { next?: string }) {
  const router = useRouter()
  const qc = useQueryClient()
  const [verified, setVerified] = useState<VerifiedAccount>()
  const [error, setError] = useState<string>()

  const banks = useQuery({ queryKey: ['banks'], queryFn: getBanks, staleTime: 60 * 60 * 1000 })
  const account = useQuery({ queryKey: ['payout-account'], queryFn: getPayoutAccount })

  const verify = useMutation({
    mutationFn: ({ bankUuid, accountNumber }: { bankUuid: string; accountNumber: string }) =>
      savePayoutAccount(bankUuid, accountNumber),
    onSuccess: (v) => {
      setVerified(v)
      setError(undefined)
    },
    onError: (err) => setError(errorMessage(err)),
  })

  const done = () => {
    void qc.invalidateQueries({ queryKey: ['payout-account'] })
    router.history.push(next ?? '/agreements')
  }

  if (account.isLoading) return <LoadingState label="Loading your payout details…" />
  if (account.isError) {
    return (
      <ErrorState
        title="We could not load your payout details"
        message={errorMessage(account.error)}
        onRetry={() => void account.refetch()}
      />
    )
  }

  return (
    <PayoutAccount
      banks={banks.data ?? []}
      loadingBanks={banks.isLoading}
      saved={account.data?.ready && account.data.accountName ? { accountName: account.data.accountName } : undefined}
      verified={verified}
      verifying={verify.isPending}
      error={error}
      onVerify={(bankUuid, accountNumber) => verify.mutate({ bankUuid, accountNumber })}
      onConfirm={done}
      onStartOver={() => {
        setVerified(undefined)
        setError(undefined)
      }}
      onDone={done}
    />
  )
}
