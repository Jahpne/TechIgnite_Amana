import { useState } from 'react'
import {
  Badge,
  Banner,
  Button,
  Card,
  ConditionChecklist,
  ConfirmDialog,
  EvidenceList,
  FilterChips,
  KeyValues,
  OutcomeBadge,
  PageTitle,
  TextArea,
  formatNaira,
  outcomeState,
} from '../../ui'
import type { EvidenceEntry, Milestone, OutcomeState, Tone } from '../../ui'
import { contractEvidence, milestoneDeploy } from '../../mocks/data'
import { isGithubPrUrl } from './amounts'

export type CiState = 'passed' | 'failed' | 'running' | 'none'

export interface CiResult {
  state: CiState
  summary: string
}

const ciBadge: Record<CiState, { tone: Tone; icon: string; label: string }> = {
  passed: { tone: 'success', icon: '✓', label: 'Tests passed' },
  failed: { tone: 'danger', icon: '!', label: 'Tests failed' },
  running: { tone: 'info', icon: '⟳', label: 'Tests running' },
  none: { tone: 'neutral', icon: '…', label: 'No test result yet' },
}

export interface ApproveMilestoneProps {
  milestone: Milestone
  freelancerName: string
  evidence: EvidenceEntry[]
  prUrl?: string
  ci: CiResult
  outcome: OutcomeState
  /** Set after the client decides. Hides the action buttons. */
  decision?: 'approved' | 'rejected'
  onApprove: () => void
  /** Called with the client's reason when they reject and open a dispute. */
  onReject: (reason: string) => void
  approving?: boolean
  rejecting?: boolean
}

// S9. Client reviews the evidence and either approves the milestone or opens a dispute.
export function ApproveMilestone({
  milestone,
  freelancerName,
  evidence,
  prUrl,
  ci,
  outcome,
  decision,
  onApprove,
  onReject,
  approving,
  rejecting,
}: ApproveMilestoneProps) {
  const [dialog, setDialog] = useState<'approve' | 'reject' | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | undefined>()

  const approvalCondition = milestone.conditions.find((c) => c.key === 'client_approval')
  const otherUnmet = milestone.conditions.filter((c) => c.key !== 'client_approval' && !c.met)
  const needsApproval = Boolean(approvalCondition && !approvalCondition.met)
  const willRelease = otherUnmet.length === 0
  const canAct = !decision && outcome !== 'DISPUTED' && milestone.status !== 'PAID'

  const closeDialog = () => {
    setDialog(null)
    setReasonError(undefined)
  }

  const submitReject = () => {
    if (reason.trim().length < 5) {
      setReasonError('Tell us what is wrong, in at least a few words.')
      return
    }
    setDialog(null)
    onReject(reason.trim())
  }

  return (
    <div className="grid gap-4">
      <PageTitle title="Review milestone" subtitle={`${freelancerName} submitted evidence for this milestone.`} />

      <Card title={milestone.title}>
        <KeyValues
          items={[
            ['Payment', formatNaira(milestone.amount)],
            ['Freelancer', freelancerName],
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Check result</span>
          <OutcomeBadge state={outcome} />
        </div>
        {outcome === 'NEEDS_HUMAN_REVIEW' && (
          <Banner tone="warning" title="An Amana reviewer will look at this">
            The automatic checks could not decide. You can still approve or open a dispute.
          </Banner>
        )}
        {outcome === 'DISPUTED' && (
          <Banner tone="danger" title="Payout is paused">
            This milestone is in a dispute. An admin will rule on it.
          </Banner>
        )}
        {outcome === 'AWAITING_EVIDENCE' && (
          <Banner tone="neutral" title="Waiting for evidence">
            {outcomeState.AWAITING_EVIDENCE.label}. Nothing to approve yet.
          </Banner>
        )}
      </Card>

      <Card title="Conditions for payment">
        <ConditionChecklist conditions={milestone.conditions} />
        {needsApproval && willRelease && (
          <Banner tone="info" title="Passing tests alone does not release the money">
            Every other condition is met, but this milestone also needs your approval. {formatNaira(milestone.amount)} is
            released to {freelancerName} only after you approve.
          </Banner>
        )}
        {needsApproval && !willRelease && (
          <Banner tone="warning" title="Other conditions are still open">
            Waiting on: {otherUnmet.map((c) => c.label).join(', ')}. Your approval is recorded, but the money is released
            only when every condition is met.
          </Banner>
        )}
        {approvalCondition?.met && <p className="text-sm text-success">You have already approved this milestone.</p>}
      </Card>

      <Card title="Evidence">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={ciBadge[ci.state].tone} icon={ciBadge[ci.state].icon}>
            {ciBadge[ci.state].label}
          </Badge>
          <span className="text-sm text-muted">{ci.summary}</span>
        </div>
        {prUrl && (
          <p className="text-sm break-all">
            Pull request:{' '}
            {isGithubPrUrl(prUrl) ? (
              <a href={prUrl} target="_blank" rel="noopener noreferrer" className="font-semibold">
                {prUrl.replace(/^https:\/\//, '')}
              </a>
            ) : (
              <span>{prUrl}</span>
            )}
          </p>
        )}
        <EvidenceList items={evidence} />
      </Card>

      {decision === 'approved' && (
        <Banner tone="success" title="You approved this milestone">
          {willRelease
            ? `${formatNaira(milestone.amount)} is being released to ${freelancerName}.`
            : 'The payment is released when the remaining conditions are met.'}
        </Banner>
      )}
      {decision === 'rejected' && (
        <Banner tone="danger" title="Dispute opened">
          Payout for this milestone is paused while an admin reviews the evidence from both of you.
        </Banner>
      )}

      {canAct && (
        <Card title="Your decision">
          <Button variant="primary" block loading={approving} onClick={() => setDialog('approve')}>
            Approve milestone
          </Button>
          <Button variant="danger" block loading={rejecting} onClick={() => setDialog('reject')}>
            Reject and open a dispute
          </Button>
        </Card>
      )}

      <ConfirmDialog
        open={dialog === 'approve'}
        title="Approve this milestone?"
        confirmLabel="Approve milestone"
        loading={approving}
        onConfirm={() => {
          setDialog(null)
          onApprove()
        }}
        onCancel={closeDialog}
      >
        {willRelease ? (
          <p>
            <strong>{formatNaira(milestone.amount)}</strong> will be released to {freelancerName}. This cannot be undone.
          </p>
        ) : (
          <p>
            Your approval will be recorded. The money is released only when the remaining conditions are also met:{' '}
            <strong>{otherUnmet.map((c) => c.label).join(', ')}</strong>.
          </p>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === 'reject'}
        title="Reject and open a dispute?"
        confirmLabel="Open dispute"
        danger
        loading={rejecting}
        onConfirm={submitReject}
        onCancel={closeDialog}
      >
        <p>
          Payout for this milestone will be <strong>paused</strong> until an admin reviews the evidence from both sides
          and decides.
        </p>
        <TextArea
          label="What is wrong?"
          value={reason}
          error={reasonError}
          onChange={(v) => {
            setReason(v)
            setReasonError(undefined)
          }}
        />
      </ConfirmDialog>
    </div>
  )
}

const outcomeOptions: { value: OutcomeState; label: string }[] = [
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'AWAITING_EVIDENCE', label: 'Awaiting evidence' },
  { value: 'NEEDS_HUMAN_REVIEW', label: 'Needs human review' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'DISPUTED', label: 'Disputed' },
]

const ciByOutcome: Record<OutcomeState, CiResult> = {
  VERIFIED: { state: 'passed', summary: '14 of 14 checks passed.' },
  AWAITING_EVIDENCE: { state: 'none', summary: 'No pull request submitted yet.' },
  NEEDS_HUMAN_REVIEW: { state: 'running', summary: 'Checks could not be read automatically.' },
  FAILED: { state: 'failed', summary: '2 of 14 checks failed.' },
  DISPUTED: { state: 'passed', summary: '14 of 14 checks passed.' },
}

// Dev gallery wrapper: drives the screen from mocks with local state. Not used in production.
export function ApproveMilestonePreview() {
  const [outcome, setOutcome] = useState<OutcomeState>('VERIFIED')
  const [decision, setDecision] = useState<'approved' | 'rejected' | undefined>()

  // "Website deployed" needs tests AND client approval. Tests pass when the outcome is Verified.
  const testsMet = outcome === 'VERIFIED'
  const milestone: Milestone = {
    ...milestoneDeploy,
    status: 'SUBMITTED',
    conditions: milestoneDeploy.conditions.map((c) => {
      if (c.key === 'tests_pass') return { ...c, met: testsMet }
      return { ...c, met: decision === 'approved' }
    }),
  }

  return (
    <div className="grid gap-4">
      <FilterChips
        label="Preview check result"
        value={outcome}
        onChange={(o) => {
          setOutcome(o)
          setDecision(undefined)
        }}
        options={outcomeOptions}
      />
      <ApproveMilestone
        milestone={milestone}
        freelancerName="David Mensah"
        evidence={contractEvidence}
        prUrl="https://github.com/david-mensah/grace-site/pull/12"
        ci={ciByOutcome[outcome]}
        outcome={outcome}
        decision={decision}
        onApprove={() => setDecision('approved')}
        onReject={() => setDecision('rejected')}
      />
    </div>
  )
}
