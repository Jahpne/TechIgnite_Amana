import { useState } from 'react'
import {
  ApprovalIndicator,
  Badge,
  Banner,
  Card,
  DisputeBanner,
  ErrorState,
  EvidenceList,
  KeyValues,
  LoadingState,
  NextActionPanel,
  PageTitle,
  StatusBadge,
  Timeline,
  formatNaira,
} from '../../ui'
import type { AgreementStatus, AgreementView, NextAction } from '../../ui'
import { makeTrade, tradeNextAction, tradeStatuses } from '../../mocks/data'
import { PreviewPanel, SelectControl } from './controls'

export type TradeRole = 'buyer' | 'seller'

export interface AgreementDetailProps {
  agreement: AgreementView
  role: TradeRole
  /** Comes from the API (`next_action`). The UI never derives it from status alone. */
  nextAction: NextAction
  onAct?: () => void
  actionLoading?: boolean
  loading?: boolean
  error?: string
  onRetry?: () => void
}

export function AgreementDetail({
  agreement: a,
  role,
  nextAction,
  onAct,
  actionLoading,
  loading,
  error,
  onRetry,
}: AgreementDetailProps) {
  if (loading) return <LoadingState label="Loading agreement…" />
  if (error) return <ErrorState title="We could not load this agreement" message={error} onRetry={onRetry} />

  const counterparty = role === 'buyer' ? a.payee : a.payer

  return (
    <div className="grid gap-4">
      <PageTitle title={a.title} subtitle={`With ${counterparty.name}`} />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={a.status} />
        <Badge tone="neutral">{a.type === 'TRADE' ? 'Trade order' : 'Milestone contract'}</Badge>
        <Badge tone="neutral">Created via {a.createdVia === 'whatsapp' ? 'WhatsApp' : 'web'}</Badge>
      </div>

      {a.disputeLocked && <DisputeBanner />}
      {a.status === 'EXPIRED' && (
        <Banner tone="warning" title="This order has expired">
          It was not paid in time, so no money was taken.
        </Banner>
      )}

      <NextActionPanel action={nextAction} onAct={onAct} loading={actionLoading} />

      <Card title="Terms">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">Total</span>
          <span className="text-3xl font-extrabold tabular-nums">{formatNaira(a.total)}</span>
        </div>
        <KeyValues
          items={[
            ['Buyer', a.payer.name],
            ['Seller', a.payee.name],
            ['Delivery terms', a.deliveryTerms ?? 'Not specified'],
            ['Expires', a.expiresAt ?? 'Expired'],
          ]}
        />
      </Card>

      <Card title="Approvals">
        <ApprovalIndicator
          version={a.version}
          parties={[
            { role: 'Buyer', party: a.payer },
            { role: 'Seller', party: a.payee },
          ]}
        />
      </Card>

      <Card title="Evidence">
        <EvidenceList items={a.evidence} />
      </Card>

      <Card title="Status timeline">
        <Timeline entries={a.timeline} />
      </Card>
    </div>
  )
}

type View = 'normal' | 'loading' | 'error'

const statusOptions = tradeStatuses.map((s) => ({ value: s, label: s.replace('_', ' ').toLowerCase() }))

/** Mock next action. Expired orders have no pending step, so the user is pointed back to their list. */
function previewAction(status: AgreementStatus, role: TradeRole): NextAction {
  if (status === 'EXPIRED') return { label: role === 'seller' ? 'Create a new order' : 'Back to my agreements' }
  return tradeNextAction(status, role)
}

export function AgreementDetailPreview() {
  const [status, setStatus] = useState<AgreementStatus>('FUNDED')
  const [role, setRole] = useState<TradeRole>('seller')
  const [view, setView] = useState<View>('normal')

  return (
    <div className="grid gap-4">
      <PreviewPanel>
        <SelectControl label="Status" value={status} options={statusOptions} onChange={setStatus} />
        <SelectControl
          label="Signed in as"
          value={role}
          options={[
            { value: 'buyer', label: 'Buyer (Chioma)' },
            { value: 'seller', label: 'Seller (Tunde)' },
          ]}
          onChange={setRole}
        />
        <SelectControl
          label="View"
          value={view}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'loading', label: 'Loading' },
            { value: 'error', label: 'Error' },
          ]}
          onChange={setView}
        />
      </PreviewPanel>
      <AgreementDetail
        agreement={makeTrade(status)}
        role={role}
        nextAction={previewAction(status, role)}
        loading={view === 'loading'}
        error={view === 'error' ? 'The server did not respond. Check your connection and try again.' : undefined}
        onRetry={() => setView('normal')}
      />
    </div>
  )
}
