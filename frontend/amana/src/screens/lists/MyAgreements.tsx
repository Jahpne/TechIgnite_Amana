import { useState } from 'react'
import {
  Banner,
  Button,
  EmptyState,
  ErrorState,
  FilterChips,
  LoadingState,
  NewAgreementMenu,
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
  /** True when this user could be owed money but has no account on file. */
  needsPayoutAccount?: boolean
  onAddPayoutAccount?: () => void
}

// S10. Presentational: the logic layer supplies rows and handles navigation.
export function MyAgreements({
  rows,
  loading,
  error,
  onRetry,
  onOpen,
  onCreateOrder,
  onNewContract,
  needsPayoutAccount,
  onAddPayoutAccount,
}: MyAgreementsProps) {
  const [filter, setFilter] = useState<AgreementFilter>('all')

  const entryPoints = <NewAgreementMenu onCreateOrder={onCreateOrder} onNewContract={onNewContract} />

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
  const needsAction = rows.filter((r) => r.needsMyAction).length

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <PageTitle title="My agreements" subtitle="Everything you are part of, and what to do next." />
        </div>
        <NewAgreementMenu onCreateOrder={onCreateOrder} onNewContract={onNewContract} />
      </div>
      {needsPayoutAccount && onAddPayoutAccount && (
        <Banner tone="warning" title="We cannot pay you yet">
          <p className="mb-2">
            Money is sent by bank transfer, so we need your account before anything can be released to you.
          </p>
          <Button onClick={onAddPayoutAccount}>Add your bank account</Button>
        </Banner>
      )}
      {needsAction > 0 && (
        <p className="text-sm font-bold text-brand">
          {needsAction === 1 ? '1 agreement needs you' : `${needsAction} agreements need you`}.
        </p>
      )}
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
                className="group grid w-full cursor-pointer gap-3 rounded-2xl border border-line bg-surface p-4 text-left shadow-card transition-all hover:-translate-y-px hover:border-brand-ring sm:p-5"
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="min-w-0 grid gap-1">
                    <span className="block font-display text-[1.0625rem] leading-snug font-bold break-words">
                      {row.title}
                    </span>
                    <span className="block text-sm text-muted">With {row.counterparty}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-display text-xl leading-none font-extrabold tabular-nums">
                      {formatNaira(row.amount)}
                    </span>
                  </span>
                </span>

                <span className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <StatusBadge status={row.status} />
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm ${
                      row.needsMyAction ? 'font-bold text-brand' : 'text-muted'
                    }`}
                  >
                    {row.needsMyAction && <span aria-hidden="true">→</span>}
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
