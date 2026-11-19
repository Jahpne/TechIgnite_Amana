import { useState } from 'react'
import {
  PaymentWaiting,
  ApprovalIndicator,
  Banner,
  Button,
  Card,
  ConfirmDialog,
  NextActionPanel,
  PageTitle,
  formatNaira,
} from '../../ui'
import type { Party } from '../../ui'
import { TermsEditor } from './TermsEditor'
import { checkSum, draftIssues, } from './amounts'
import type { TermsDraft } from './amounts'

export interface ReviewTermsProps {
  draft: TermsDraft
  onDraftChange: (draft: TermsDraft) => void
  /** Latest saved version. Edits create version + 1 when saved. */
  version: number
  /** Payer is the client, payee is the freelancer. */
  payer: Party
  payee: Party
  viewerRole: 'payer' | 'payee'
  /** True when the draft differs from the saved version. */
  dirty: boolean
  /** Label terms "Suggested by AI, please review" until the version is approved by both. */
  aiGenerated: boolean
  /** Paga checkout was opened and the backend has not confirmed funding yet. */
  paymentVerifying?: boolean
  /** Returns the payer to the account details when the wait drags on. */
  onPaymentBack?: () => void
  onSave: () => void
  onApprove: () => void
  onFund: () => void
  saving?: boolean
  approving?: boolean
  funding?: boolean
}

// S7. Both parties review the latest version and approve it explicitly. Funding unlocks only after both approve.
export function ReviewTerms({
  draft,
  onDraftChange,
  version,
  payer,
  payee,
  viewerRole,
  dirty,
  aiGenerated,
  paymentVerifying,
  onPaymentBack,
  onSave,
  onApprove,
  onFund,
  saving,
  approving,
  funding,
}: ReviewTermsProps) {
  const [confirm, setConfirm] = useState<'save' | 'approve' | null>(null)

  const check = checkSum(draft)
  const issues = draftIssues(draft)
  const valid = issues.length === 0
  const isApproved = (p: Party) => p.approvedVersion === version
  const viewer = viewerRole === 'payer' ? payer : payee
  const other = viewerRole === 'payer' ? payee : payer
  const viewerApproved = isApproved(viewer)
  const bothApproved = isApproved(payer) && isApproved(payee)
  const approvalsToClear = [payer, payee].filter(isApproved).map((p) => p.name)
  const locked = Boolean(saving || approving || funding || paymentVerifying)

  const handleSave = () => (approvalsToClear.length > 0 ? setConfirm('save') : onSave())

  const confirmAction = () => {
    if (confirm === 'save') onSave()
    if (confirm === 'approve') onApprove()
    setConfirm(null)
  }

  return (
    <div className="grid gap-4">
      <PageTitle
        title="Review the terms"
        subtitle={`Version ${version}. Any change creates a new version and both of you approve it again.`}
      />

      {aiGenerated && (
        <Banner tone="ai" title="Suggested by AI, please review">
          These terms were drafted by AI. They only take effect when both of you approve.
        </Banner>
      )}

      <Card title="Approvals">
        <ApprovalIndicator
          version={version}
          parties={[
            { role: 'Client', party: payer },
            { role: 'Freelancer', party: payee },
          ]}
        />
      </Card>

      <TermsEditor draft={draft} onChange={onDraftChange} showAiLabels={aiGenerated && !bothApproved} disabled={locked} />

      {dirty && (
        <Banner tone="warning" title="You have unsaved edits">
          Save them to create version {version + 1}. You can approve only a saved version.
          {approvalsToClear.length > 0 && ` Saving clears the approval from ${approvalsToClear.join(' and ')}.`}
        </Banner>
      )}

      {!valid && (
        <Banner tone="danger" title="These terms cannot be approved yet">
          <ul className="m-0 grid list-disc gap-1 pl-5">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </Banner>
      )}

      {paymentVerifying ? (
        <PaymentWaiting onBack={onPaymentBack} />
      ) : dirty ? (
        <Button variant="primary" block loading={saving} disabled={!valid} onClick={handleSave}>
          Save changes as version {version + 1}
        </Button>
      ) : bothApproved ? (
        viewerRole === 'payer' ? (
          <NextActionPanel action={{ label: `Fund ${formatNaira(check.total)} with Paga` }} onAct={onFund} loading={funding} />
        ) : (
          <NextActionPanel action={{ label: '', waitingOn: `${payer.name} to fund the contract` }} />
        )
      ) : viewerApproved ? (
        <NextActionPanel action={{ label: '', waitingOn: `${other.name} to approve version ${version}` }} />
      ) : (
        <Card>
          <Button variant="primary" block loading={approving} disabled={!valid} onClick={() => setConfirm('approve')}>
            Approve version {version}
          </Button>
          {!valid && <p className="text-xs text-muted">Fix the problems above to approve.</p>}
        </Card>
      )}

      <ConfirmDialog
        open={confirm === 'save'}
        title={`Save as version ${version + 1}?`}
        confirmLabel={`Save version ${version + 1}`}
        onConfirm={confirmAction}
        onCancel={() => setConfirm(null)}
      >
        <p>
          Saving creates a new version. The approval from <strong>{approvalsToClear.join(' and ')}</strong> will be
          cleared, and both of you must approve version {version + 1}.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirm === 'approve'}
        title={`Approve version ${version}?`}
        confirmLabel="Approve these terms"
        onConfirm={confirmAction}
        onCancel={() => setConfirm(null)}
      >
        <p>
          You agree to a total of <strong>{formatNaira(check.total)}</strong> across {draft.milestones.length}{' '}
          {draft.milestones.length === 1 ? 'milestone' : 'milestones'}.
        </p>
        <p>If anyone edits the terms later, this approval is cleared and you will be asked again.</p>
      </ConfirmDialog>
    </div>
  )
}
