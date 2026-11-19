import { toEvidence } from '../api/mappers'
import type { ApiMilestone } from '../api/types'
import { useApproveMilestone, useRejectMilestone } from '../hooks/actions'
import { errorMessage } from '../hooks/errors'
import { useAgreement } from '../hooks/agreements'
import { ApproveMilestone } from '../screens/contract/ApproveMilestone'
import type { CiResult } from '../screens/contract/ApproveMilestone'
import { Banner, ErrorState, LoadingState } from '../ui'
import type { OutcomeState } from '../ui'

const needsTests = (m: ApiMilestone) => m.conditionsJson.includes('tests_pass')

function ciFor(m: ApiMilestone, hasGithub: boolean): CiResult {
  if (!needsTests(m)) return { state: 'none', summary: 'This milestone is checked by you, not by a machine.' }
  if (m.testsPassedAt) return { state: 'passed', summary: 'The automated checks passed.' }
  if (hasGithub) return { state: 'running', summary: 'Waiting for the automated checks to finish.' }
  return { state: 'none', summary: 'No pull request has been submitted for the automated check yet.' }
}

function outcomeFor(m: ApiMilestone): OutcomeState {
  switch (m.status) {
    case 'REJECTED':
      return 'FAILED'
    case 'DISPUTED':
      return 'DISPUTED'
    case 'VERIFIED':
    case 'RELEASABLE':
    case 'PAYING_OUT':
    case 'PAID':
      return 'VERIFIED'
    case 'SUBMITTED':
      return needsTests(m) && !m.testsPassedAt ? 'AWAITING_EVIDENCE' : 'VERIFIED'
    default:
      return 'AWAITING_EVIDENCE'
  }
}

// S9. The client reviews the evidence and approves or rejects. A milestone is paid only when
// every condition is met, so passing tests alone do not release money if approval is also needed.
export function ApproveMilestonePage({ id, milestoneId }: { id: string; milestoneId: string }) {
  const a = useAgreement(id)
  const approve = useApproveMilestone(id, milestoneId)
  const reject = useRejectMilestone(id, milestoneId)

  if (a.isPending) return <LoadingState label="Loading milestone…" />
  if (a.error || !a.view || !a.raw) {
    return <ErrorState message={errorMessage(a.error)} onRetry={() => void a.refetch()} />
  }
  const apiMilestone = a.raw.milestones.find((m) => m.id === milestoneId)
  const milestone = a.view.milestones.find((m) => m.id === milestoneId)
  if (!apiMilestone || !milestone) {
    return <ErrorState title="Milestone not found" message="This milestone is not part of this agreement." />
  }
  if (a.raw.viewerRole !== 'payer') {
    return <ErrorState title="Only the client can do this" message="Approving a milestone is the client's step." />
  }

  const evidence = a.raw.evidence.filter((e) => e.milestoneId === milestoneId)
  const github = evidence.find((e) => e.type === 'GITHUB')
  const prUrl = typeof github?.payloadJson.prUrl === 'string' ? github.payloadJson.prUrl : undefined
  const decision =
    apiMilestone.status === 'REJECTED' ? 'rejected' : apiMilestone.approvedAt || apiMilestone.status === 'PAID' ? 'approved' : undefined

  const error = approve.error ?? reject.error

  return (
    <div className="grid gap-4">
      {error && (
        <Banner tone="danger" title="That did not work">
          {errorMessage(error)}
        </Banner>
      )}
      <ApproveMilestone
        milestone={milestone}
        freelancerName={a.view.payee.name}
        evidence={evidence.map(toEvidence)}
        prUrl={prUrl}
        ci={ciFor(apiMilestone, Boolean(github))}
        outcome={outcomeFor(apiMilestone)}
        decision={decision}
        approving={approve.isPending}
        rejecting={reject.isPending}
        onApprove={() => approve.mutate()}
        onReject={(reason) => reject.mutate(reason)}
      />
    </div>
  )
}
