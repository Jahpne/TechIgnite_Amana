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

/**
 * Starters, deliberately not all software. A blank box is the hardest thing to
 * answer, and these also show at a glance that Amana is for any kind of work.
 */
const EXAMPLES: [string, string][] = [
  ['Wedding photos', 'I need a photographer for my wedding on 20 December in Uyo: full day cover and 60 edited photos. Budget ₦250,000.'],
  ['Shop website', 'I need a 5 page website for my bakery, finished in 3 weeks. My budget is ₦100,000.'],
  ['Brand identity', 'I need a logo, colour palette and simple brand guide for my skincare line. Budget ₦120,000 over 4 weeks.'],
  ['Shop fit-out', 'I need shelving built and installed in my shop in Ikeja, finished before 15 December. Budget ₦180,000.'],
]

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

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card title="The project">
          <div className="grid gap-2">
            <span className="text-sm font-bold">Not sure how to start?</span>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map(([label, text]) => (
                <button
                  key={label}
                  type="button"
                  disabled={compiling}
                  onClick={() => onDescriptionChange(text)}
                  className="min-h-9 cursor-pointer rounded-full border border-line bg-surface-2 px-3.5 text-xs font-bold text-muted transition-colors hover:border-brand-ring hover:text-ink disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <TextArea
            label="What do you need done?"
            hint={`Any kind of work — design, photography, building, writing, software. Say what you want, when, and how much you can pay.`}
            placeholder="I need a 5 page website for my bakery, finished in 3 weeks. My budget is ₦100,000."
            value={description}
            disabled={compiling}
            onChange={onDescriptionChange}
          />
          <p className="-mt-2 text-xs text-muted">
            {description.trim().length < MIN_DESCRIPTION
              ? `${MIN_DESCRIPTION - description.trim().length} more characters needed.`
              : 'Long enough — the more detail you give, the better the milestones.'}
          </p>

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
            <p className="text-xs text-muted">
              Suggesting again replaces the terms below, including any edits you made.
            </p>
          )}
        </Card>

        <aside className="grid h-fit gap-4 rounded-2xl bg-surface-ink p-5 text-white lg:sticky lg:top-24">
          <span className="text-[0.68rem] font-bold tracking-[0.14em] text-white/45 uppercase">
            What happens next
          </span>
          <ol className="m-0 grid list-none gap-3.5 p-0">
            {[
              ['We suggest milestones', 'Split into stages with an amount and what proves each one is done.'],
              ['You both approve', 'Edit anything first. Nothing is binding until you both agree.'],
              ['You fund it once', 'The money is held — not sent to them, not kept by us.'],
              ['Each stage pays on its own', 'Work approved, that milestone is released. The rest stays held.'],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/15 text-[0.65rem] font-black"
                >
                  {i + 1}
                </span>
                <span className="text-[0.82rem] leading-snug">
                  <strong className="block font-bold">{title}</strong>
                  <span className="text-white/60">{body}</span>
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>

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
