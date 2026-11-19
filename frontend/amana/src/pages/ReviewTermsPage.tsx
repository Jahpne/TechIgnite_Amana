import { useMemo, useState } from 'react'
import { toFundingAccount } from '../api/mappers'
import type { ApiAgreement, ApiAgreementStatus } from '../api/types'
import { useApproveAgreement, usePatchTerms } from '../hooks/actions'
import { errorMessage } from '../hooks/errors'
import { usePolledAgreement } from '../hooks/agreements'
import { DEFAULT_DISPUTE_TERMS, draftFromAgreement, draftsEqual } from '../screens/contract/amounts'
import type { TermsDraft } from '../screens/contract/amounts'
import { ReviewTerms } from '../screens/contract/ReviewTerms'
import { Banner, ErrorState, FundingInstructions, LoadingState } from '../ui'
import type { AgreementView } from '../ui'
import { milestonesFromDraft, totalKoboFromDraft } from './termsDraft'

const WAITING: readonly ApiAgreementStatus[] = ['AWAITING_PAYMENT']

export function ReviewTermsPage({ id }: { id: string }) {
  const a = usePolledAgreement(id, WAITING)

  if (a.isPending) return <LoadingState label="Loading terms…" />
  if (a.error || !a.view || !a.raw) {
    return <ErrorState message={errorMessage(a.error)} onRetry={() => void a.refetch()} />
  }
  if (a.raw.viewerRole === 'observer') {
    return <ErrorState title="No access" message="You are not a party to this agreement." />
  }

  // Keyed by version: when a new version is saved the editor starts again from it.
  return <TermsEditor key={a.raw.terms[0]?.version ?? a.raw.version} id={id} raw={a.raw} view={a.view} />
}

function TermsEditor({ id, raw, view }: { id: string; raw: ApiAgreement; view: AgreementView }) {
  const approve = useApproveAgreement(id)
  const patch = usePatchTerms(id)
  const [verifying, setVerifying] = useState(false)

  const saved = useMemo<TermsDraft>(() => {
    const dispute = raw.terms[0]?.termsJson?.disputeTerms
    return draftFromAgreement(view, typeof dispute === 'string' ? dispute : DEFAULT_DISPUTE_TERMS)
  }, [raw, view])
  const [draft, setDraft] = useState<TermsDraft>(saved)

  const viewerRole = raw.viewerRole === 'payer' ? 'payer' : 'payee'
  const error = approve.error ?? patch.error
  const awaitingPayment = raw.status === 'AWAITING_PAYMENT'

  return (
    <div className="grid gap-4">
      {error && (
        <Banner tone="danger" title="That did not work">
          {errorMessage(error)}
        </Banner>
      )}
      {awaitingPayment && viewerRole === 'payer' && !verifying && (
        <div id="funding">
          <FundingInstructions funding={toFundingAccount(raw)} onPaid={() => setVerifying(true)} />
        </div>
      )}
      <ReviewTerms
        draft={draft}
        onDraftChange={setDraft}
        version={view.version}
        payer={view.payer}
        payee={view.payee}
        viewerRole={viewerRole}
        dirty={!draftsEqual(saved, draft)}
        aiGenerated={raw.terms[0]?.aiGenerated ?? false}
        paymentVerifying={verifying && awaitingPayment}
        onPaymentBack={() => setVerifying(false)}
        saving={patch.isPending}
        approving={approve.isPending}
        onSave={() =>
          patch.mutate({
            totalAmount: totalKoboFromDraft(draft),
            milestones: milestonesFromDraft(draft),
            disputeTerms: draft.disputeTerms,
          })
        }
        onApprove={() => approve.mutate()}
        onFund={() => document.getElementById('funding')?.scrollIntoView({ behavior: 'smooth' })}
      />
    </div>
  )
}
