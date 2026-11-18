import { useState } from 'react'
import { toAdminDispute } from '../api/mappers'
import { useOpenDisputes, useRuleDispute } from '../hooks/actions'
import { errorMessage } from '../hooks/errors'
import { AdminDisputes } from '../screens/lists/AdminDisputes'
import { Banner } from '../ui'

// S11. Admin only. A person rules RELEASE or REFUND. The backend refuses anyone who is not an admin.
export function AdminDisputesPage() {
  const list = useOpenDisputes()
  const rule = useRuleDispute()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="grid gap-4">
      {rule.error && (
        <Banner tone="danger" title="The ruling was not saved">
          {errorMessage(rule.error)}
        </Banner>
      )}
      <AdminDisputes
        disputes={(list.data ?? []).map(toAdminDispute)}
        selectedId={selectedId}
        onSelect={setSelectedId}
        loading={list.isPending}
        error={list.error ? errorMessage(list.error) : undefined}
        onRetry={() => void list.refetch()}
        submitting={rule.isPending}
        onRule={(disputeId, ruling, note) =>
          rule.mutate(
            { id: disputeId, body: { decision: ruling === 'release' ? 'RELEASE' : 'REFUND', reasoning: note } },
            { onSuccess: () => setSelectedId(null) },
          )
        }
      />
    </div>
  )
}
