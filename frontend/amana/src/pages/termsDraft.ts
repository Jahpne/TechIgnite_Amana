import { nairaToKobo } from '../api/mappers'
import type { ApiCompiledTerms, MilestoneInput } from '../api/types'
import { parseNaira } from '../screens/contract/amounts'
import type { ConditionKey, TermsDraft } from '../screens/contract/amounts'

const isCondition = (c: string): c is ConditionKey => c === 'client_approval' || c === 'tests_pass'

/** The AI compiler's output (integer kobo, snake_case) to the editable draft the screens use (whole naira). */
export function draftFromCompiled(t: ApiCompiledTerms): TermsDraft {
  return {
    total: String(Math.round(t.total_amount / 100)),
    disputeTerms: t.dispute_terms,
    milestones: t.milestones.map((m, i) => {
      const conditions = m.conditions.filter(isCondition)
      return {
        id: `m${i + 1}`,
        title: m.title,
        amount: String(Math.round(m.amount / 100)),
        conditions: conditions.length > 0 ? conditions : ['client_approval'],
        verification: m.verification === 'automated_test' ? 'automated_test' : 'client_approval',
      }
    }),
  }
}

/** The draft's milestones in the shape the backend expects (integer kobo). */
export function milestonesFromDraft(d: TermsDraft): MilestoneInput[] {
  return d.milestones.map((m) => ({
    title: m.title.trim(),
    amount: nairaToKobo(parseNaira(m.amount)),
    conditions: m.conditions,
    verification: m.verification,
  }))
}

export function totalKoboFromDraft(d: TermsDraft): number {
  return nairaToKobo(parseNaira(d.total))
}
