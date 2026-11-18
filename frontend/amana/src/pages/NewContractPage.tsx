import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toE164 } from '../auth/phone'
import { useCompileAgreement, useCreateMilestoneAgreement } from '../hooks/actions'
import { errorMessage } from '../hooks/errors'
import { draftIssues } from '../screens/contract/amounts'
import type { TermsDraft } from '../screens/contract/amounts'
import { NewContract } from '../screens/contract/NewContract'
import type { CompileStatus } from '../screens/contract/NewContract'
import { isValidNigerianPhone } from '../screens/trade/shared'
import { Banner } from '../ui'
import { draftFromCompiled, milestonesFromDraft, totalKoboFromDraft } from './termsDraft'

const MIN_DESCRIPTION = 10

// S6. The client describes the project, the AI proposes terms, the client edits them,
// then we create the agreement. Nothing binds anyone until both parties approve (S7).
export function NewContractPage() {
  const navigate = useNavigate()
  const compile = useCompileAgreement()
  const create = useCreateMilestoneAgreement()
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [draft, setDraft] = useState<TermsDraft>()
  const [formError, setFormError] = useState<string>()

  const status: CompileStatus = compile.isPending ? 'compiling' : compile.isError ? 'error' : draft ? 'ready' : 'idle'

  const runCompile = () => {
    setFormError(undefined)
    if (description.trim().length < MIN_DESCRIPTION) {
      setFormError(`Describe the project in a little more detail (at least ${MIN_DESCRIPTION} characters).`)
      return
    }
    compile.mutate({ description: description.trim() }, { onSuccess: (r) => setDraft(draftFromCompiled(r.terms)) })
  }

  const runContinue = () => {
    setFormError(undefined)
    if (!draft) return
    if (!isValidNigerianPhone(phone)) {
      setFormError("Enter a valid Nigerian phone number for the freelancer, for example 0801 234 5678.")
      return
    }
    const issues = draftIssues(draft)
    if (issues.length > 0) {
      setFormError(issues[0])
      return
    }
    create.mutate(
      {
        title: description.trim().slice(0, 80),
        freelancerPhone: toE164(phone),
        totalAmount: totalKoboFromDraft(draft),
        milestones: milestonesFromDraft(draft),
        disputeTerms: draft.disputeTerms,
        aiGenerated: true,
        createdVia: 'WEB',
      },
      { onSuccess: (agreement) => void navigate({ to: '/agreements/$id/terms', params: { id: agreement.id } }) },
    )
  }

  const shownError = formError ?? (create.error ? errorMessage(create.error) : undefined)

  return (
    <div className="grid gap-4">
      {shownError && (
        <Banner tone="danger" title="We could not continue">
          {shownError}
        </Banner>
      )}
      <NewContract
        description={description}
        onDescriptionChange={setDescription}
        counterpartyPhone={phone}
        onCounterpartyPhoneChange={setPhone}
        status={status}
        errorMessage={compile.error ? errorMessage(compile.error) : undefined}
        draft={draft}
        onDraftChange={setDraft}
        onCompile={runCompile}
        onContinue={runContinue}
      />
    </div>
  )
}
