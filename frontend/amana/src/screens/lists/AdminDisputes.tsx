import { useState } from 'react'
import {
  Badge,
  Banner,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  EvidenceList,
  LoadingState,
  OutcomeBadge,
  PageTitle,
  TextArea,
  formatNaira,
} from '../../ui'
import type { OutcomeState } from '../../ui'
import type { AdminDispute, DisputeSide } from '../../ui'

export type Ruling = 'release' | 'refund'
export type ReviewDecision = 'approve' | 'reject'

// A milestone that OutcomeOS flagged for a human to look at.
export interface ReviewItem {
  id: string
  agreementTitle: string
  milestoneTitle: string
  amount: number
  outcome: OutcomeState
  reason: string
}

export interface AdminDisputesProps {
  disputes: AdminDispute[]
  reviewItems?: ReviewItem[]
  selectedId?: string | null
  onSelect: (id: string | null) => void
  loading?: boolean
  error?: string
  onRetry?: () => void
  submitting?: boolean
  onRule: (disputeId: string, ruling: Ruling, note: string) => void
  onReview?: (itemId: string, decision: ReviewDecision, note: string) => void
}

interface Choice {
  label: string
  confirmLabel: string
  consequence: string
  danger?: boolean
  value: string
}

// Shared by disputes and manual-review milestones: a required note, then a confirm step.
function DecisionForm({
  choices,
  submitting,
  amount,
  onDecide,
}: {
  choices: [Choice, Choice]
  submitting?: boolean
  amount: number
  onDecide: (value: string, note: string) => void
}) {
  const [note, setNote] = useState('')
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState<Choice | null>(null)

  const start = (c: Choice) => {
    if (note.trim().length === 0) {
      setError('Add a note explaining your decision. It is saved in the audit log.')
      return
    }
    setError(undefined)
    setPending(c)
  }

  return (
    <div className="grid gap-3">
      <TextArea
        label="Decision note (required)"
        hint="Explain which evidence led to your decision. Both parties and the audit log can see it."
        error={error}
        value={note}
        onChange={(v) => {
          setNote(v)
          if (error && v.trim()) setError(undefined)
        }}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        {choices.map((c, i) => (
          <Button key={c.value} variant={i === 0 ? 'primary' : 'danger'} onClick={() => start(c)}>
            {c.label}
          </Button>
        ))}
      </div>
      <ConfirmDialog
        open={pending !== null}
        title={pending?.confirmLabel ?? ''}
        confirmLabel={pending?.confirmLabel ?? 'Confirm'}
        danger={pending?.danger}
        loading={submitting}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) onDecide(pending.value, note.trim())
          setPending(null)
        }}
      >
        <p>
          <strong>{formatNaira(amount)}</strong> {pending?.consequence}
        </p>
        <p className="text-muted">This decision cannot be undone.</p>
      </ConfirmDialog>
    </div>
  )
}

function SideCard({ side }: { side: DisputeSide }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{side.party}</h3>
        <Badge tone="neutral">{side.role}</Badge>
      </div>
      <blockquote className="border-l-4 border-line pl-3 text-sm">{side.statement}</blockquote>
      <h4 className="text-sm font-semibold">Evidence</h4>
      <EvidenceList items={side.evidence} />
    </Card>
  )
}

function DisputeDetail({
  dispute,
  submitting,
  onBack,
  onRule,
}: {
  dispute: AdminDispute
  submitting?: boolean
  onBack: () => void
  onRule: AdminDisputesProps['onRule']
}) {
  const ruled = dispute.status === 'RULED'
  return (
    <div className="grid gap-4">
      <div>
        <Button variant="ghost" onClick={onBack}>← All disputes</Button>
      </div>
      <PageTitle title={dispute.title} subtitle={`Dispute ${dispute.id} · opened ${dispute.openedAt}`} />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-muted">Held amount</span>
          <span className="text-2xl font-extrabold tabular-nums">{formatNaira(dispute.amount)}</span>
        </div>
        <p className="text-sm"><strong>Reason given:</strong> {dispute.reason}</p>
        <Banner tone="warning" title="A person decides this">
          Amana does not rule on disputes automatically. Read the evidence from both sides before deciding.
        </Banner>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <SideCard side={dispute.buyerSide} />
        <SideCard side={dispute.sellerSide} />
      </div>

      {ruled ? (
        <Banner tone="success" title="Ruling recorded">This dispute has been ruled. See the audit log for the decision note.</Banner>
      ) : (
        <Card title="Your ruling">
          <DecisionForm
            amount={dispute.amount}
            submitting={submitting}
            choices={[
              {
                value: 'release',
                label: 'Rule release to seller',
                confirmLabel: 'Release payment to the seller',
                consequence: 'will be paid out to the seller.',
              },
              {
                value: 'refund',
                label: 'Rule refund to buyer',
                confirmLabel: 'Refund the buyer',
                consequence: 'will be refunded to the buyer.',
                danger: true,
              },
            ]}
            onDecide={(value, note) => onRule(dispute.id, value as Ruling, note)}
          />
        </Card>
      )}
    </div>
  )
}

function ReviewDetail({
  item,
  submitting,
  onBack,
  onReview,
}: {
  item: ReviewItem
  submitting?: boolean
  onBack: () => void
  onReview: NonNullable<AdminDisputesProps['onReview']>
}) {
  return (
    <div className="grid gap-4">
      <div>
        <Button variant="ghost" onClick={onBack}>← All disputes</Button>
      </div>
      <PageTitle title={item.milestoneTitle} subtitle={item.agreementTitle} />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <OutcomeBadge state={item.outcome} />
          <span className="text-2xl font-extrabold tabular-nums">{formatNaira(item.amount)}</span>
        </div>
        <p className="text-sm"><strong>Why it needs a person:</strong> {item.reason}</p>
      </Card>
      <Card title="Your decision">
        <DecisionForm
          amount={item.amount}
          submitting={submitting}
          choices={[
            {
              value: 'approve',
              label: 'Approve milestone',
              confirmLabel: 'Approve this milestone',
              consequence: 'will become eligible for payout to the freelancer.',
            },
            {
              value: 'reject',
              label: 'Reject milestone',
              confirmLabel: 'Reject this milestone',
              consequence: 'will stay unreleased and the milestone goes back to the freelancer.',
              danger: true,
            },
          ]}
          onDecide={(value, note) => onReview(item.id, value as ReviewDecision, note)}
        />
      </Card>
    </div>
  )
}

// S11. Admin only. List first, then a detail view. Works on mobile, roomier on desktop.
export function AdminDisputes({
  disputes,
  reviewItems = [],
  selectedId,
  onSelect,
  loading,
  error,
  onRetry,
  submitting,
  onRule,
  onReview,
}: AdminDisputesProps) {
  if (loading) return <LoadingState label="Loading disputes…" />
  if (error) return <ErrorState title="We could not load disputes" message={error} onRetry={onRetry} />

  const selectedDispute = disputes.find((d) => d.id === selectedId)
  if (selectedDispute) {
    return (
      <DisputeDetail dispute={selectedDispute} submitting={submitting} onBack={() => onSelect(null)} onRule={onRule} />
    )
  }
  const selectedReview = reviewItems.find((r) => r.id === selectedId)
  if (selectedReview && onReview) {
    return (
      <ReviewDetail item={selectedReview} submitting={submitting} onBack={() => onSelect(null)} onReview={onReview} />
    )
  }

  const open = disputes.filter((d) => d.status === 'OPEN')
  const ruled = disputes.filter((d) => d.status === 'RULED')

  return (
    <div className="grid gap-6">
      <PageTitle title="Disputes" subtitle="Review evidence from both sides, then rule release or refund." />

      <section aria-labelledby="open-disputes" className="grid gap-2">
        <h2 id="open-disputes" className="text-lg font-semibold">Open disputes ({open.length})</h2>
        {open.length === 0 ? (
          <EmptyState title="No open disputes" description="New disputes appear here as soon as a party opens one." />
        ) : (
          <DisputeTable rows={open} onSelect={onSelect} caption="Open disputes waiting for a ruling" />
        )}
      </section>

      {reviewItems.length > 0 && (
        <section aria-labelledby="review-items" className="grid gap-2">
          <h2 id="review-items" className="text-lg font-semibold">Milestones needing human review ({reviewItems.length})</h2>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <caption className="sr-only">Milestones that automatic checks could not decide</caption>
              <thead className="border-b border-line text-muted">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">Milestone</th>
                  <th scope="col" className="px-3 py-2 font-semibold">State</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Amount</th>
                  <th scope="col" className="px-3 py-2"><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody>
                {reviewItems.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <th scope="row" className="px-3 py-2 font-medium">
                      {r.milestoneTitle}
                      <span className="block text-xs font-normal text-muted">{r.agreementTitle}</span>
                    </th>
                    <td className="px-3 py-2"><OutcomeBadge state={r.outcome} /></td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatNaira(r.amount)}</td>
                    <td className="px-3 py-2 text-right">
                      <Button onClick={() => onSelect(r.id)} aria-label={`Review ${r.milestoneTitle}`}>Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {ruled.length > 0 && (
        <section aria-labelledby="ruled-disputes" className="grid gap-2">
          <h2 id="ruled-disputes" className="text-lg font-semibold">Ruled ({ruled.length})</h2>
          <DisputeTable rows={ruled} onSelect={onSelect} caption="Disputes that already have a ruling" />
        </section>
      )}
    </div>
  )
}

function DisputeTable({
  rows,
  caption,
  onSelect,
}: {
  rows: AdminDispute[]
  caption: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-line text-muted">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">Agreement</th>
            <th scope="col" className="px-3 py-2 font-semibold">Opened</th>
            <th scope="col" className="px-3 py-2 font-semibold">Status</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Amount</th>
            <th scope="col" className="px-3 py-2"><span className="sr-only">Action</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id} className="border-b border-line last:border-0">
              <th scope="row" className="px-3 py-2 font-medium">
                {d.title}
                <span className="block text-xs font-normal text-muted">{d.reason}</span>
              </th>
              <td className="px-3 py-2 whitespace-nowrap">{d.openedAt}</td>
              <td className="px-3 py-2">
                <Badge tone={d.status === 'OPEN' ? 'danger' : 'success'} icon={d.status === 'OPEN' ? '!' : '✓'}>
                  {d.status === 'OPEN' ? 'Open' : 'Ruled'}
                </Badge>
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{formatNaira(d.amount)}</td>
              <td className="px-3 py-2 text-right">
                <Button onClick={() => onSelect(d.id)} aria-label={`Open dispute for ${d.title}`}>
                  {d.status === 'OPEN' ? 'Review' : 'View'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
