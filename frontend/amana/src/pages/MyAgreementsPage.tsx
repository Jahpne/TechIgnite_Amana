import { useNavigate } from '@tanstack/react-router'
import { toAgreementRow } from '../api/mappers'
import { useAgreements } from '../hooks/agreements'
import { errorMessage } from '../hooks/errors'
import { MyAgreements } from '../screens/lists/MyAgreements'

// S10. The list the signed-in user is a party to.
export function MyAgreementsPage() {
  const navigate = useNavigate()
  const list = useAgreements()

  return (
    <MyAgreements
      rows={(list.data ?? []).map(toAgreementRow)}
      loading={list.isPending}
      error={list.error ? errorMessage(list.error) : undefined}
      onRetry={() => void list.refetch()}
      onOpen={(id) => void navigate({ to: '/agreements/$id', params: { id } })}
      onCreateOrder={() => void navigate({ to: '/orders/new' })}
      onNewContract={() => void navigate({ to: '/contracts/new' })}
    />
  )
}
