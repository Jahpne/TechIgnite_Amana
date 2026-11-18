import { Banner, Button, Card, LoadingState, PageTitle, PhoneInput, TextArea } from '../../ui'
import { TermsEditor } from './TermsEditor'
import { draftIssues } from './amounts'
import type { TermsDraft } from './amounts'

export type CompileStatus = 'idle' | 'compiling' | 'error' | 'ready'

export interface NewContractProps {
  description: string
  onDescriptionChange: (value: string) => void
  counterpartyPhone: string
  onCounterpartyPhoneChange: (value: string) => void
  status: CompileStatus
  errorMessage?: string
  /** The AI result as an editable draft. Present when status is "ready". */
  draft?: TermsDraft
  onDraftChange: (draft: TermsDraft) => void
  onCompile: () => void
  /** Go to the review screen (S7) with the edited draft. */
  onContinue: () => void
}

const MIN_DESCRIPTION = 20

// S6. Client describes the project; the AI proposes terms that both parties must still approve.
export function NewContract({
  description,
  onDescriptionChange,
  counterpartyPhone,
  onCounterpartyPhoneChange,
  status,
  errorMessage,
  draft,
  onDraftChange,
  onCompile,
  onContinue,
}: NewContractProps) {
  const compiling = status === 'compiling'
  const canCompile = description.trim().length >= MIN_DESCRIPTION && counterpartyPhone.trim().length >= 10 && !compiling
  const issues = draft ? draftIssues(draft) : []

  return (
    <div className="grid gap-4">
      <PageTitle
        title="New contract"
        subtitle="Describe the work in your own words. We suggest milestones and amounts, and you both approve them before any money moves."
      />

      <Card title="The project">
        <TextArea
          label="What do you need done?"
          hint={`At least ${MIN_DESCRIPTION} characters. Say what you want, when, and how much you can pay.`}
          placeholder="I need a 5 page website for my bakery, finished in 3 weeks. My budget is ₦100,000."
          value={description}
          disabled={compiling}
          onChange={onDescriptionChange}
        />
        <PhoneInput
          label="Freelancer's phone number"
          hint="They will get a message to review and approve the agreement."
          value={counterpartyPhone}
          disabled={compiling}
          onChange={onCounterpartyPhoneChange}
        />
        <Button variant="primary" block loading={compiling} disabled={!canCompile} onClick={onCompile}>
          {status === 'ready' ? 'Suggest again' : 'Suggest milestones'}
        </Button>
        {status === 'ready' && (
          <p className="text-xs text-muted">Suggesting again replaces the terms below, including any edits you made.</p>
        )}
      </Card>

      {compiling && <LoadingState label="Turning your description into milestones…" />}

      {status === 'error' && (
        <Banner tone="danger" title="We could not suggest terms">
          {errorMessage ?? 'Please check your description and try again.'}
        </Banner>
      )}

      {status === 'ready' && draft && (
        <>
          <Banner tone="ai" title="Suggested by AI, please review">
            Nothing is agreed yet. Check every amount and condition, edit anything that is wrong, then continue. Both of
            you must approve before the contract can be funded.
          </Banner>
          <TermsEditor draft={draft} onChange={onDraftChange} showAiLabels />
          {issues.length > 0 && (
            <Banner tone="warning" title="Fix these before you continue">
              <ul className="m-0 grid list-disc gap-1 pl-5">
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </Banner>
          )}
          <Button variant="primary" block disabled={issues.length > 0} onClick={onContinue}>
            Continue to review
          </Button>
        </>
      )}
    </div>
  )
}
