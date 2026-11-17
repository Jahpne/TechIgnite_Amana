import { AiSuggestionLabel, AmountInput, Banner, Button, Card, Field, TextArea, TextField } from '../../ui'
import {
  CONDITION_KEYS,
  CONDITION_LABELS,
  VERIFICATION_KEYS,
  VERIFICATION_LABELS,
  checkSum,
  describeSum,
  newDraftMilestone,
} from './amounts'
import type { ConditionKey, DraftMilestone, TermsDraft, VerificationKey } from './amounts'

const selectClass =
  'min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-ink aria-[invalid=true]:border-danger'

// Shared by S6 (AI result) and S7 (review and edit). Presentational: the parent owns the draft.
export function TermsEditor({
  draft,
  onChange,
  showAiLabels,
  disabled,
}: {
  draft: TermsDraft
  onChange: (draft: TermsDraft) => void
  /** Label every term "Suggested by AI, please review". */
  showAiLabels?: boolean
  disabled?: boolean
}) {
  const check = checkSum(draft)

  const patchMilestone = (id: string, patch: Partial<DraftMilestone>) =>
    onChange({ ...draft, milestones: draft.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)) })

  const toggleCondition = (m: DraftMilestone, key: ConditionKey, on: boolean) =>
    patchMilestone(m.id, {
      conditions: on ? CONDITION_KEYS.filter((k) => k === key || m.conditions.includes(k)) : m.conditions.filter((k) => k !== key),
    })

  return (
    <div className="grid gap-4">
      <Card title="Contract total">
        {showAiLabels && (
          <div>
            <AiSuggestionLabel />
          </div>
        )}
        <AmountInput
          label="Total amount"
          hint="Whole naira. The milestones below must add up to exactly this amount."
          value={draft.total}
          disabled={disabled}
          onChange={(total) => onChange({ ...draft, total })}
        />
      </Card>

      <Card title="Milestones">
        {draft.milestones.map((m, i) => (
          <fieldset key={m.id} className="m-0 grid gap-3 rounded-lg border border-line p-3">
            <legend className="px-1 text-sm font-semibold">Milestone {i + 1}</legend>
            {showAiLabels && (
              <div>
                <AiSuggestionLabel />
              </div>
            )}
            <TextField
              label="Title"
              value={m.title}
              disabled={disabled}
              error={m.title.trim() === '' ? 'Give this milestone a title.' : undefined}
              onChange={(title) => patchMilestone(m.id, { title })}
            />
            <AmountInput
              label="Amount"
              value={m.amount}
              disabled={disabled}
              onChange={(amount) => patchMilestone(m.id, { amount })}
            />
            <fieldset className="m-0 grid gap-1 border-0 p-0">
              <legend className="mb-1 p-0 text-sm font-semibold">Release conditions</legend>
              {CONDITION_KEYS.map((key) => (
                <label key={key} className="flex min-h-11 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="size-5 accent-brand"
                    checked={m.conditions.includes(key)}
                    disabled={disabled}
                    onChange={(e) => toggleCondition(m, key, e.target.checked)}
                  />
                  <span>{CONDITION_LABELS[key]}</span>
                </label>
              ))}
              <span className="text-xs text-muted">The milestone is paid only when every ticked condition is met.</span>
            </fieldset>
            <Field label="How it is verified">
              {(a11y) => (
                <select
                  className={selectClass}
                  {...a11y}
                  value={m.verification}
                  disabled={disabled}
                  onChange={(e) => patchMilestone(m.id, { verification: e.target.value as VerificationKey })}
                >
                  {VERIFICATION_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {VERIFICATION_LABELS[key]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <div>
              <Button
                variant="ghost"
                disabled={disabled || draft.milestones.length <= 1}
                onClick={() => onChange({ ...draft, milestones: draft.milestones.filter((x) => x.id !== m.id) })}
                aria-label={`Remove milestone ${i + 1}`}
              >
                Remove milestone
              </Button>
            </div>
          </fieldset>
        ))}

        <Button
          disabled={disabled}
          onClick={() => onChange({ ...draft, milestones: [...draft.milestones, newDraftMilestone(crypto.randomUUID())] })}
        >
          Add a milestone
        </Button>

        {check.ok ? (
          <Banner tone="success" title="Milestones add up">
            {describeSum(check)}
          </Banner>
        ) : (
          <Banner tone="danger" title="Milestone amounts do not add up">
            {describeSum(check)} Approval stays blocked until the amounts match the contract total.
          </Banner>
        )}
      </Card>

      <Card title="If there is a dispute">
        {showAiLabels && (
          <div>
            <AiSuggestionLabel />
          </div>
        )}
        <TextArea
          label="Dispute terms"
          hint="What happens to the money if either of you opens a dispute."
          value={draft.disputeTerms}
          disabled={disabled}
          onChange={(disputeTerms) => onChange({ ...draft, disputeTerms })}
        />
      </Card>
    </div>
  )
}
