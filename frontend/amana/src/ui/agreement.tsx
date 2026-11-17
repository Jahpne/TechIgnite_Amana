import type { ReactNode } from 'react'
import { Badge, Button, Card, KeyValues } from './primitives'
import { agreementStatus, formatNaira, milestoneStatus, outcomeState } from './status'
import type {
  AgreementStatus,
  EvidenceEntry,
  Milestone,
  NextAction,
  OutcomeState,
  Party,
  TimelineEntry,
} from './types'

export function StatusBadge({ status }: { status: AgreementStatus }) {
  const m = agreementStatus[status]
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

// Always one primary action, or a plain "waiting on" message.
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
    <section className="card next-action" aria-label="Next step">
      <span className="eyebrow">Your next step</span>
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
    <ol className="timeline">
      {entries.map((e) => (
        <li key={e.id}>
          <div>
            <strong>{e.actor}</strong> {e.action}
          </div>
          <div className="when">
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
    <div className="approvals">
      <span className="muted">Approvals for version {version}</span>
      {parties.map(({ role, party }) => {
        const approved = party.approvedVersion === version
        return (
          <div key={role} className="approval">
            <span>
              {party.name} <span className="muted">({role})</span>
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
    <li className="evidence-item">
      <strong>{item.title}</strong>
      <span className="muted">
        {evidenceLabel[item.kind]} · {item.at}
      </span>
      {item.detail && <span>{item.detail}</span>}
    </li>
  )
}

export function EvidenceList({ items }: { items: EvidenceEntry[] }) {
  if (items.length === 0) return <p className="muted">No evidence yet.</p>
  return (
    <>
      <ul className="list">
        {items.map((i) => (
          <EvidenceItem key={i.id} item={i} />
        ))}
      </ul>
      <p className="muted">Evidence cannot be changed once it is attached.</p>
    </>
  )
}

export function ConditionChecklist({ conditions }: { conditions: Milestone['conditions'] }) {
  return (
    <ul className="checklist">
      {conditions.map((c) => (
        <li key={c.key} className={c.met ? 'met' : 'unmet'}>
          {c.met ? '✓ Met:' : '○ Not yet:'} {c.label}
        </li>
      ))}
    </ul>
  )
}

export function MilestoneCard({ milestone, footer }: { milestone: Milestone; footer?: ReactNode }) {
  const m = milestoneStatus[milestone.status]
  return (
    <div className="milestone">
      <div className="row between">
        <strong>{milestone.title}</strong>
        <span className="amount">{formatNaira(milestone.amount)}</span>
      </div>
      <div className="row">
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
        <Badge tone="ai" icon="✦">
          Suggested by AI, please review
        </Badge>
      )}
      <div className="row between">
        <span className="muted">Total</span>
        <span className="amount big">{formatNaira(total)}</span>
      </div>
      <KeyValues items={items} />
    </Card>
  )
}
