import { useState } from 'react'
import {
  Button,
  EmptyState,
  ErrorState,
  FilterChips,
  LoadingState,
  PageTitle,
  StatusBadge,
  formatNaira,
} from '../../ui'
import type { AgreementStatus } from '../../ui'
import type { AgreementRow } from '../../ui'

export type AgreementFilter =
  | 'all'
  | 'needs_action'
  | 'awaiting_payment'
  | 'in_progress'
  | 'completed'
  | 'disputed'
  | 'expired'

const statusGroups: Record<Exclude<AgreementFilter, 'all' | 'needs_action'>, AgreementStatus[]> = {
  awaiting_payment: ['DRAFT', 'AWAITING_PAYMENT'],
  in_progress: ['FUNDED', 'IN_PROGRESS', 'EVIDENCE_IN', 'RELEASABLE', 'PAYING_OUT'],
  completed: ['COMPLETED', 'REFUNDED'],
  disputed: ['DISPUTED'],
  expired: ['EXPIRED'],
}

function matchesFilter(row: AgreementRow, filter: AgreementFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'needs_action') return row.needsMyAction
  return statusGroups[filter].includes(row.status)
}

const filterLabels: [AgreementFilter, string][] = [
  ['all', 'All'],
  ['needs_action', 'Needs my action'],
  ['awaiting_payment', 'Awaiting payment'],
  ['in_progress', 'In progress'],
  ['completed', 'Completed'],
  ['disputed', 'Disputed'],
  ['expired', 'Expired'],
]

export interface MyAgreementsProps {
  rows: AgreementRow[]
  loading?: boolean
  error?: string
  onRetry?: () => void
  onOpen: (id: string) => void
  onCreateOrder: () => void
  onNewContract: () => void
}

// S10. Presentational: the logic layer supplies rows and handles navigation.
export function MyAgreements({ rows, loading, error, onRetry, onOpen, onCreateOrder, onNewContract }: MyAgreementsProps) {
  const [filter, setFilter] = useState<AgreementFilter>('all')

  const entryPoints = (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="primary" onClick={onCreateOrder}>Create an order</Button>
      <Button onClick={onNewContract}>Start a contract</Button>
    </div>
  )

  if (loading) {
    return (
      <>
        <PageTitle title="My agreements" />
        <LoadingState label="Loading your agreements…" />
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageTitle title="My agreements" />
        <ErrorState title="We could not load your agreements" message={error} onRetry={onRetry} />
      </>
    )
  }

  if (rows.length === 0) {
    return (
      <>
        <PageTitle title="My agreements" />
        <EmptyState
          title="No agreements yet"
          description="Sell something with a protected order, or hire someone with a milestone contract."
          action={entryPoints}
        />
      </>
    )
  }

  const options = filterLabels.map(([value, label]) => ({
    value,
    label: `${label} (${rows.filter((r) => matchesFilter(r, value)).length})`,
  }))
  const visible = rows.filter((r) => matchesFilter(r, filter))

  return (
    <>
      <PageTitle title="My agreements" subtitle="Everything you are part of, and what to do next." />
      <FilterChips label="Filter agreements by status" options={options} value={filter} onChange={setFilter} />
      {visible.length === 0 ? (
        <EmptyState title="Nothing here" description="No agreements match this filter." />
      ) : (
        <ul className="grid gap-3">
          {visible.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onOpen(row.id)}
                className="grid min-h-11 w-full cursor-pointer gap-2 rounded-xl border border-line bg-surface p-4 text-left shadow-sm hover:bg-surface-2"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-semibold break-words">{row.title}</span>
                    <span className="block text-sm text-muted">With {row.counterparty}</span>
                  </span>
                  <span className="font-extrabold tabular-nums">{formatNaira(row.amount)}</span>
                </span>
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge status={row.status} />
                  <span className={`text-sm ${row.needsMyAction ? 'font-bold text-brand' : 'text-muted'}`}>
                    {row.needsMyAction ? 'Your turn: ' : ''}
                    {row.nextActionLabel}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
