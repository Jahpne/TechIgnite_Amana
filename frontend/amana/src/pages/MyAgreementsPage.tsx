import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toAgreementRow } from '../api/mappers'
import { getPayoutAccount } from '../api/payments'
import { useAgreements } from '../hooks/agreements'
import { errorMessage } from '../hooks/errors'
import { MyAgreements } from '../screens/lists/MyAgreements'

// S10. The list the signed-in user is a party to.
export function MyAgreementsPage() {
  const navigate = useNavigate()
  const list = useAgreements()
  // Only worth asking about once someone actually has a deal running.
  const payout = useQuery({ queryKey: ['payout-account'], queryFn: getPayoutAccount })

  const rows = (list.data ?? []).map(toAgreementRow)
  const owedSomething = rows.some((r) => r.status !== 'EXPIRED')

  return (
    <MyAgreements
      rows={rows}
      loading={list.isPending}
      error={list.error ? errorMessage(list.error) : undefined}
      onRetry={() => void list.refetch()}
      needsPayoutAccount={owedSomething && payout.data?.ready === false}
      onAddPayoutAccount={() => void navigate({ to: '/payouts/account' })}
      onOpen={(id) => void navigate({ to: '/agreements/$id', params: { id } })}
      onCreateOrder={() => void navigate({ to: '/orders/new' })}
      onNewContract={() => void navigate({ to: '/contracts/new' })}
    />
  )
}
