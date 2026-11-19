import { } from 'react'
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
import type { AgreementView, NextAction } from '../../ui'

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
    <div className="grid gap-5">
      <div className="grid gap-2.5">
        <PageTitle title={a.title} subtitle={`With ${counterparty.name}`} />
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={a.status} type={a.type} />
          <Badge tone="neutral">{a.type === 'TRADE' ? 'Trade order' : 'Milestone contract'}</Badge>
          <Badge tone="neutral">Created via {a.createdVia === 'whatsapp' ? 'WhatsApp' : 'web'}</Badge>
        </div>
      </div>

      {a.disputeLocked && <DisputeBanner />}
      {a.status === 'EXPIRED' && (
        <Banner tone="warning" title="This order has expired">
          It was not paid in time, so no money was taken.
        </Banner>
      )}

      <NextActionPanel action={nextAction} onAct={onAct} loading={actionLoading} />

      {/*
        The money and what happens next belong together in the main column.
        Approvals and history are reference material, so they sit alongside on
        a wide screen instead of pushing the important things off the fold.
      */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="grid gap-5">
          <Card title="Terms">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted">Total</span>
              <span className="font-display text-3xl font-extrabold tabular-nums">{formatNaira(a.total)}</span>
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

          <Card title="Evidence">
            <EvidenceList items={a.evidence} />
          </Card>
        </div>

        <div className="grid gap-5">
          <Card title="Approvals">
            <ApprovalIndicator
              version={a.version}
              parties={[
                { role: 'Buyer', party: a.payer },
                { role: 'Seller', party: a.payee },
              ]}
            />
          </Card>

          <Card title="Status timeline">
            <Timeline entries={a.timeline} />
          </Card>
        </div>
      </div>
    </div>
  )
}
