import type { ReactNode } from 'react'
import { Badge, Button, Card } from './primitives'
import { agreementStatusMeta, formatNaira, milestoneStatus, outcomeState } from './status'
import type {
  AgreementStatus,
  EvidenceEntry,
  Milestone,
  NextAction,
  OutcomeState,
  Party,
  TimelineEntry,
} from './types'

export function StatusBadge({ status, type }: { status: AgreementStatus; type?: 'TRADE' | 'MILESTONE' }) {
  const m = agreementStatusMeta(status, type)
  return (
    <Badge tone={m.tone} icon={m.icon}>
      {m.label}
    </Badge>
  )
}

export function OutcomeBadge({ state }: { state: OutcomeState }) {
  const m = outcomeState[state]
  return (
    <Badge tone={m.tone} icon={m.icon}>
      {m.label}
    </Badge>
  )
}

// Always exactly one primary action, or a plain "waiting for" message.
export function NextActionPanel({
  action,
  onAct,
  loading,
}: {
  action: NextAction
  onAct?: () => void
  loading?: boolean
}) {
  return (
    <section aria-label="Next step" className="grid gap-3 rounded-xl border-2 border-brand bg-brand-soft p-4 text-ink">
      <span className="text-xs font-bold tracking-wider text-brand-strong uppercase">Your next step</span>
      {action.waitingOn ? (
        <p>
          <strong>Waiting for {action.waitingOn}.</strong> We will notify you when it is your turn.
        </p>
      ) : (
        <Button variant={action.tone === 'danger' ? 'danger' : 'primary'} block loading={loading} onClick={onAct}>
          {action.label}
        </Button>
      )}
    </section>
  )
}

// Read-only. Mirrors the backend audit log.
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="m-0 grid list-none p-0">
      {entries.map((e, i) => (
        <li key={e.id} className="relative pb-4 pl-6 text-sm last:pb-0">
          <span aria-hidden="true" className="absolute top-1.5 left-[5px] size-2.5 rounded-full bg-brand" />
          {i < entries.length - 1 && (
            <span aria-hidden="true" className="absolute top-4.5 -bottom-1 left-[9px] w-0.5 bg-line" />
          )}
          <div>
            <strong>{e.actor}</strong> {e.action}
          </div>
          <div className="text-xs text-muted">
            {e.at}
            {e.evidence ? ` · Evidence: ${e.evidence}` : ''}
          </div>
        </li>
      ))}
    </ol>
  )
}

export function ApprovalIndicator({
  parties,
  version,
}: {
  parties: { role: string; party: Party }[]
  version: number
}) {
  return (
    <div className="grid gap-2">
      <span className="text-sm text-muted">Approvals for version {version}</span>
      {parties.map(({ role, party }) => {
        const approved = party.approvedVersion === version
        return (
          <div key={role} className="flex items-center justify-between gap-3">
            <span>
              {party.name} <span className="text-sm text-muted">({role})</span>
            </span>
            <Badge tone={approved ? 'success' : 'neutral'} icon={approved ? '✓' : '…'}>
              {approved ? 'Approved' : 'Not yet approved'}
            </Badge>
          </div>
        )
      })}
    </div>
  )
}

const evidenceLabel: Record<EvidenceEntry['kind'], string> = {
  chowdeck: 'Chowdeck delivery',
  github: 'GitHub',
  upload: 'Upload',
  buyer_confirm: 'Buyer confirmation',
}

export function EvidenceItem({ item }: { item: EvidenceEntry }) {
  return (
    <li className="grid gap-0.5 rounded-lg border border-line p-3 text-sm">
      <strong>{item.title}</strong>
      <span className="text-muted">
        {evidenceLabel[item.kind]} · {item.at}
      </span>
      {item.detail && <span>{item.detail}</span>}
    </li>
  )
}

export function EvidenceList({ items }: { items: EvidenceEntry[] }) {
  if (items.length === 0) return <p className="text-sm text-muted">No evidence yet.</p>
  return (
    <>
      <ul className="m-0 grid list-none gap-3 p-0">
        {items.map((i) => (
          <EvidenceItem key={i.id} item={i} />
        ))}
      </ul>
      <p className="text-xs text-muted">Evidence cannot be changed once it is attached.</p>
    </>
  )
}

export function ConditionChecklist({ conditions }: { conditions: Milestone['conditions'] }) {
  return (
    <ul className="m-0 grid list-none gap-1 p-0 text-sm">
      {conditions.map((c) => (
        <li key={c.key} className={c.met ? 'text-success' : 'text-muted'}>
          <span aria-hidden="true">{c.met ? '✓' : '○'}</span> {c.label}
          <span className="sr-only">{c.met ? ' (met)' : ' (not yet met)'}</span>
        </li>
      ))}
    </ul>
  )
}

export function MilestoneCard({ milestone, footer }: { milestone: Milestone; footer?: ReactNode }) {
  const m = milestoneStatus[milestone.status]
  return (
    <div className="grid gap-2 rounded-lg border border-line bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <strong>{milestone.title}</strong>
        <span className="font-extrabold tabular-nums">{formatNaira(milestone.amount)}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={m.tone} icon={m.icon}>
          {m.label}
        </Badge>
        {milestone.aiSuggested && (
          <Badge tone="ai" icon="✦">
            Suggested by AI, please review
          </Badge>
        )}
      </div>
      <ConditionChecklist conditions={milestone.conditions} />
      {footer}
    </div>
  )
}

export function TermsView({
  total,
  items,
  aiGenerated,
}: {
  total: number
  items: [string, ReactNode][]
  aiGenerated?: boolean
}) {
  return (
    <Card title="Terms">
      {aiGenerated && (
        <div>
          <Badge tone="ai" icon="✦">
            Suggested by AI, please review
          </Badge>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted">Total</span>
        <span className="text-3xl font-extrabold tabular-nums">{formatNaira(total)}</span>
      </div>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-[0.95rem]">
        {items.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="m-0 text-right break-words">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
