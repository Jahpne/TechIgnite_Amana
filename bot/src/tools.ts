import { amana, AmanaError } from './amana.js'
import type { Agreement } from './amana.js'
import { config } from './config.js'
import { SessionExpired } from './sessions.js'
import type { Pending } from './sessions.js'

// The tools the AI may call. Each one is a real Amana endpoint, called with the person's own token.
//
// Reading is free. Every tool that WRITES is only ever "asked for": the bot checks the details,
// writes the confirmation itself, and runs the call only when the person replies 1. The AI can
// never run a write on its own, so it cannot approve, confirm, dispute or move money.

export class ArgError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ArgError'
  }
}

type Args = Record<string, unknown>

export interface ToolDef {
  name: string
  description: string
  parameters: Record<string, unknown>
  write: boolean
}

const obj = (properties: Record<string, unknown>, required: string[]) => ({
  type: 'object',
  properties,
  required,
  additionalProperties: false,
})
const text = (description: string) => ({ type: 'string', description })
const AGREEMENT_ID = text('The agreement id (a UUID) taken from list_my_agreements or get_agreement. Never invent one.')
const MILESTONE_ID = text('The milestone id (a UUID) taken from get_agreement. Never invent one.')

export const TOOLS: ToolDef[] = [
  // ------------------------------------------------------------ reading
  {
    name: 'list_my_agreements',
    description: "List the person's agreements (orders and contracts): id, title, status, their role, and whose turn it is.",
    parameters: obj({}, []),
    write: false,
  },
  {
    name: 'get_agreement',
    description: 'Details of one agreement: status, next step, approvals, milestones, and the account to pay into when payment is due.',
    parameters: obj({ agreement_id: AGREEMENT_ID }, ['agreement_id']),
    write: false,
  },
  {
    name: 'get_agreement_history',
    description: 'The recent history (audit log) of one agreement.',
    parameters: obj({ agreement_id: AGREEMENT_ID }, ['agreement_id']),
    write: false,
  },
  {
    name: 'get_payment_status',
    description: 'Payment and payout status for one agreement, including how much is held.',
    parameters: obj({ agreement_id: AGREEMENT_ID }, ['agreement_id']),
    write: false,
  },
  {
    name: 'propose_contract_terms',
    description: 'Ask the contract writer to propose milestones and amounts for a described project. Only a proposal: nothing is created.',
    parameters: obj(
      {
        description: text('The project in plain words, at least 10 characters.'),
        budget_naira: { type: 'number', description: 'Optional total budget in whole naira.' },
      },
      ['description'],
    ),
    write: false,
  },
  // ------------------------------------------------------------ writing (always confirmed by the person)
  {
    name: 'create_protected_order',
    description: 'Create a protected order as the seller. The person is asked to confirm before anything is created.',
    parameters: obj(
      {
        item: text('What is being sold.'),
        price_naira: { type: 'number', description: 'Price in whole naira, for example 180000.' },
        buyer_phone: text("The buyer's Nigerian phone number."),
        delivery_terms: text('Optional delivery terms.'),
        pickup_address: text('Optional pickup address.'),
        dropoff_address: text('Optional drop-off address.'),
      },
      ['item', 'price_naira', 'buyer_phone'],
    ),
    write: true,
  },
  {
    name: 'create_contract',
    description: 'Create a milestone contract as the client. The amounts are summed for you.',
    parameters: obj(
      {
        title: text('A short title for the contract.'),
        freelancer_phone: text("The freelancer's Nigerian phone number."),
        milestones: {
          type: 'array',
          description: 'One to twelve milestones.',
          items: obj(
            {
              title: text('Milestone title.'),
              amount_naira: { type: 'number', description: 'Whole naira.' },
              conditions: {
                type: 'array',
                items: { type: 'string', enum: ['client_approval', 'tests_pass', 'evidence_submitted'] },
                description: 'What must be true before it is paid. Defaults to client_approval.',
              },
            },
            ['title', 'amount_naira'],
          ),
        },
        dispute_terms: text('Optional dispute terms.'),
      },
      ['title', 'freelancer_phone', 'milestones'],
    ),
    write: true,
  },
  {
    name: 'approve_terms',
    description: 'Approve the current terms of an agreement. Approving means agreeing to them.',
    parameters: obj({ agreement_id: AGREEMENT_ID }, ['agreement_id']),
    write: true,
  },
  {
    name: 'hand_item_to_delivery',
    description: 'As the seller, ask Chowdeck to collect the item. Only after the buyer has paid.',
    parameters: obj(
      {
        agreement_id: AGREEMENT_ID,
        pickup_address: text('Where Chowdeck collects the item.'),
        dropoff_address: text('Where it is delivered.'),
        item_description: text('A short description of the item.'),
      },
      ['agreement_id', 'pickup_address', 'dropoff_address', 'item_description'],
    ),
    write: true,
  },
  {
    name: 'confirm_receipt',
    description: 'As the buyer, confirm the item arrived. This releases the payment to the seller.',
    parameters: obj({ agreement_id: AGREEMENT_ID }, ['agreement_id']),
    write: true,
  },
  {
    name: 'report_problem',
    description: 'As the buyer, report a problem with a delivery. The payout is locked until an admin reviews it.',
    parameters: obj({ agreement_id: AGREEMENT_ID, reason: text('What is wrong, at least 5 characters.') }, ['agreement_id', 'reason']),
    write: true,
  },
  {
    name: 'open_dispute',
    description: 'Open a dispute on an agreement or one of its milestones. The payout is locked until an admin reviews it.',
    parameters: obj(
      { agreement_id: AGREEMENT_ID, reason: text('Why, at least 5 characters.'), milestone_id: MILESTONE_ID },
      ['agreement_id', 'reason'],
    ),
    write: true,
  },
  {
    name: 'submit_milestone_evidence',
    description: 'As the freelancer, submit evidence for a milestone: a GitHub pull request link and/or a note. Evidence cannot be changed afterwards.',
    parameters: obj(
      {
        agreement_id: AGREEMENT_ID,
        milestone_id: MILESTONE_ID,
        pr_url: text('A GitHub pull request link.'),
        note: text('A note for the client.'),
      },
      ['agreement_id', 'milestone_id'],
    ),
    write: true,
  },
  {
    name: 'approve_milestone',
    description: 'As the client, approve a milestone. When all its conditions are met, it is paid out.',
    parameters: obj({ agreement_id: AGREEMENT_ID, milestone_id: MILESTONE_ID }, ['agreement_id', 'milestone_id']),
    write: true,
  },
  {
    name: 'reject_milestone',
    description: 'As the client, reject a milestone with a reason.',
    parameters: obj(
      { agreement_id: AGREEMENT_ID, milestone_id: MILESTONE_ID, reason: text('Why, at least 3 characters.') },
      ['agreement_id', 'milestone_id', 'reason'],
    ),
    write: true,
  },
]

const BY_NAME = new Map(TOOLS.map((t) => [t.name, t]))

export function isWriteTool(name: string): boolean {
  return BY_NAME.get(name)?.write === true
}

export function isKnownTool(name: string): boolean {
  return BY_NAME.has(name)
}

/** The tool list in the shape OpenAI-compatible services expect. */
export const TOOL_SPECS = TOOLS.map((t) => ({
  type: 'function' as const,
  function: { name: t.name, description: t.description, parameters: t.parameters },
}))

// ---------------------------------------------------------------- argument checks

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PHONE = /^(\+?234\d{10}|0\d{10})$/

function str(a: Args, key: string, min: number, max: number): string {
  const v = a[key]
  if (typeof v !== 'string') throw new ArgError(`"${key}" is required and must be text.`)
  const t = v.trim()
  if (t.length < min || t.length > max) throw new ArgError(`"${key}" must be ${min} to ${max} characters long.`)
  return t
}

function optStr(a: Args, key: string, min: number, max: number): string | undefined {
  const v = a[key]
  if (v === undefined || v === null || v === '') return undefined
  return str(a, key, min, max)
}

function idArg(a: Args, key: string): string {
  const v = typeof a[key] === 'string' ? (a[key] as string).trim() : ''
  if (!UUID.test(v)) throw new ArgError(`"${key}" must be an id from the tools. Do not make one up.`)
  return v
}

function phoneArg(a: Args, key: string): string {
  const v = str(a, key, 7, 20).replace(/[\s-]/g, '')
  if (!PHONE.test(v)) throw new ArgError(`"${key}" must be a Nigerian phone number such as 08012345678.`)
  return v
}

/** Whole naira from the AI to integer kobo for the backend. */
function koboArg(a: Args, key: string): number {
  const v = a[key]
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 100 || v > 1_000_000_000) {
    throw new ArgError(`"${key}" must be a whole amount in naira between 100 and 1,000,000,000.`)
  }
  return Math.round(v) * 100
}

const naira = (kobo: string | number): string => `₦${(Number(kobo) / 100).toLocaleString('en-NG')}`

function roleName(a: Agreement): string {
  if (a.viewerRole === 'observer') return 'observer'
  if (a.type === 'TRADE') return a.viewerRole === 'payer' ? 'buyer' : 'seller'
  return a.viewerRole === 'payer' ? 'client' : 'freelancer'
}

function brief(a: Agreement) {
  return {
    agreement_id: a.id,
    title: a.title,
    type: a.type === 'TRADE' ? 'order' : 'contract',
    status: a.status,
    your_role: roleName(a),
    total: naira(a.totalAmount),
    your_turn: a.nextAction.isYours,
    next_step: a.nextAction.label,
    dispute_locked: a.disputeLock,
  }
}

async function loadAsParty(token: string, a: Args): Promise<Agreement> {
  const agreement = await amana.getAgreement(token, idArg(a, 'agreement_id'))
  if (agreement.viewerRole === 'observer') throw new ArgError('The person is not a party to that agreement.')
  return agreement
}

function requireRole(agreement: Agreement, role: 'payer' | 'payee', words: string): void {
  if (agreement.viewerRole !== role) throw new ArgError(`Only ${words} can do that on this agreement.`)
}

// ---------------------------------------------------------------- reading

/** Runs a read-only tool and returns something small enough to hand back to the AI. */
export async function runRead(name: string, a: Args, token: string): Promise<unknown> {
  switch (name) {
    case 'list_my_agreements': {
      const rows = await amana.listAgreements(token)
      return rows.slice(0, 15).map(brief)
    }
    case 'get_agreement': {
      const ag = await loadAsParty(token, a)
      const payment = ag.payments?.find((p) => p.virtualAccountNumber)
      return {
        ...brief(ag),
        approvals: ag.approvals
          ? { you_or_buyer_approved: Boolean(ag.approvals.payer), other_party_approved: Boolean(ag.approvals.payee), both: ag.approvals.bothApproved }
          : undefined,
        milestones: ag.milestones?.map((m) => ({
          milestone_id: m.id,
          title: m.title,
          amount: naira(m.amount),
          status: m.status,
          conditions: m.conditionsJson,
        })),
        delivery_status: ag.deliveries?.[0]?.status,
        // Only the buyer pays, and only while payment is due.
        pay_into: ag.status === 'AWAITING_PAYMENT' && ag.viewerRole === 'payer' && payment
          ? { account_number: payment.virtualAccountNumber, amount: naira(payment.amount) }
          : undefined,
      }
    }
    case 'get_agreement_history': {
      const id = idArg(a, 'agreement_id')
      await amana.getAgreement(token, id)
      const log = await amana.timeline(token, id)
      return log.slice(-10).map((e) => ({ when: e.createdAt, what: e.action, status: e.toStatus }))
    }
    case 'get_payment_status': {
      const id = idArg(a, 'agreement_id')
      await amana.getAgreement(token, id)
      const status = await amana.paymentStatus(token, id)
      return {
        payments: status.payments.map((p) => ({ status: p.status, amount: naira(p.amount) })),
        held: naira(status.balance.held),
        released: naira(status.balance.released),
      }
    }
    case 'propose_contract_terms': {
      const description = str(a, 'description', 10, 4000)
      const budget = typeof a.budget_naira === 'number' && a.budget_naira > 0 ? koboArg(a, 'budget_naira') : undefined
      const result = await amana.compile(token, { description, budgetAmount: budget })
      return {
        proposal_only: true,
        total: naira(result.terms.total_amount),
        milestones: result.terms.milestones.map((m) => ({
          title: m.title,
          amount_naira: m.amount / 100,
          conditions: m.conditions,
        })),
        dispute_terms: result.terms.dispute_terms,
        note: result.disclaimer,
      }
    }
    default:
      throw new ArgError(`There is no read tool called "${name}".`)
  }
}

// ---------------------------------------------------------------- writing (prepared, then confirmed by the person)

type Prepared = Pick<Pending, 'summary' | 'run'>

const ASK = 'Reply 1 to go ahead or 2 to cancel.'

/**
 * Checks the details of a write and writes the confirmation. Nothing is sent to the backend here
 * except reads used to describe the action accurately. The returned `run` is what the person's "1" starts.
 */
export async function prepareWrite(name: string, a: Args, token: string): Promise<Prepared> {
  switch (name) {
    case 'create_protected_order': {
      const item = str(a, 'item', 2, 140)
      const amount = koboArg(a, 'price_naira')
      const buyer = phoneArg(a, 'buyer_phone')
      const terms = optStr(a, 'delivery_terms', 2, 500)
      const pickup = optStr(a, 'pickup_address', 3, 300)
      const dropoff = optStr(a, 'dropoff_address', 3, 300)
      return {
        summary: `Create a protected order:\n• Item: ${item}\n• Price: ${naira(amount)}\n• Buyer: ${buyer}${terms ? `\n• Delivery: ${terms}` : ''}\nThe buyer is then asked to review and pay Amana. ${ASK}`,
        run: async (t) => {
          const created = await amana.createTrade(t, {
            title: item, amount, buyerPhone: buyer, deliveryTerms: terms, pickupAddress: pickup, dropoffAddress: dropoff, createdVia: 'WHATSAPP',
          })
          return `Done. Your protected order is created.\nSend this link to the buyer so they can review and pay:\n${config.webUrl}/o/${created.id}`
        },
      }
    }
    case 'create_contract': {
      const title = str(a, 'title', 2, 140)
      const freelancer = phoneArg(a, 'freelancer_phone')
      const raw = a.milestones
      if (!Array.isArray(raw) || raw.length < 1 || raw.length > 12) throw new ArgError('"milestones" must have 1 to 12 items.')
      const ALLOWED = ['client_approval', 'tests_pass', 'evidence_submitted']
      const milestones = raw.map((m, i) => {
        if (typeof m !== 'object' || m === null) throw new ArgError(`Milestone ${i + 1} is not valid.`)
        const ma = m as Args
        const conds = Array.isArray(ma.conditions) && ma.conditions.length > 0 ? ma.conditions : ['client_approval']
        if (!conds.every((c) => typeof c === 'string' && ALLOWED.includes(c))) throw new ArgError(`Milestone ${i + 1} has an unknown condition.`)
        return {
          title: str(ma, 'title', 2, 140),
          amount: koboArg(ma, 'amount_naira'),
          conditions: conds as string[],
          verification: conds.includes('tests_pass') ? 'automated_test' : 'client_approval',
        }
      })
      const total = milestones.reduce((sum, m) => sum + m.amount, 0)
      const disputeTerms = optStr(a, 'dispute_terms', 5, 500)
      const lines = milestones.map((m, i) => `${i + 1}. ${m.title}: ${naira(m.amount)}`).join('\n')
      return {
        summary: `Create a contract "${title}" with ${freelancer}:\n${lines}\nTotal: ${naira(total)}\nNothing is paid until you both approve the terms and the client funds it. ${ASK}`,
        run: async (t) => {
          const created = await amana.createMilestoneAgreement(t, {
            title, freelancerPhone: freelancer, totalAmount: total, milestones, disputeTerms, createdVia: 'WHATSAPP',
          })
          return `Done. The contract is created. Review and approve the terms here:\n${config.webUrl}/agreements/${created.id}/terms`
        },
      }
    }
    case 'approve_terms': {
      const ag = await loadAsParty(token, a)
      return {
        summary: `Approve the terms of "${ag.title}" (${naira(ag.totalAmount)}). Approving means you agree to them. ${ASK}`,
        run: async (t) => {
          await amana.approve(t, ag.id)
          return `Done. You approved the terms of "${ag.title}".`
        },
      }
    }
    case 'hand_item_to_delivery': {
      const ag = await loadAsParty(token, a)
      requireRole(ag, 'payee', 'the seller')
      const pickup = str(a, 'pickup_address', 3, 300)
      const dropoff = str(a, 'dropoff_address', 3, 300)
      const item = str(a, 'item_description', 2, 200)
      return {
        summary: `Ask Chowdeck to collect "${item}" for "${ag.title}":\n• From: ${pickup}\n• To: ${dropoff}\n${ASK}`,
        run: async (t) => {
          await amana.startDelivery(t, ag.id, { pickupAddress: pickup, dropoffAddress: dropoff, itemDescription: item })
          return `Done. Delivery is requested for "${ag.title}".`
        },
      }
    }
    case 'confirm_receipt': {
      const ag = await loadAsParty(token, a)
      requireRole(ag, 'payer', 'the buyer')
      return {
        summary: `Confirm you received "${ag.title}" (${naira(ag.totalAmount)}). This releases the payment to the seller and cannot be undone. ${ASK}`,
        run: async (t) => {
          await amana.confirm(t, ag.id, { outcome: 'CONFIRM' })
          return `Done. Payment for "${ag.title}" is being released to the seller.`
        },
      }
    }
    case 'report_problem': {
      const ag = await loadAsParty(token, a)
      requireRole(ag, 'payer', 'the buyer')
      const reason = str(a, 'reason', 5, 500)
      return {
        summary: `Report a problem with "${ag.title}": "${reason}". The payout is locked until an admin reviews it. ${ASK}`,
        run: async (t) => {
          await amana.confirm(t, ag.id, { outcome: 'PROBLEM', note: reason })
          return `Noted. A problem is reported on "${ag.title}" and the payout is locked until it is reviewed.`
        },
      }
    }
    case 'open_dispute': {
      const ag = await loadAsParty(token, a)
      const reason = str(a, 'reason', 5, 1000)
      const milestoneId = a.milestone_id ? idArg(a, 'milestone_id') : undefined
      return {
        summary: `Open a dispute on "${ag.title}": "${reason}". The payout is locked until an admin reviews it. ${ASK}`,
        run: async (t) => {
          await amana.dispute(t, ag.id, { reason, milestoneId })
          return `Done. A dispute is open on "${ag.title}" and the payout is locked.`
        },
      }
    }
    case 'submit_milestone_evidence':
    case 'approve_milestone':
    case 'reject_milestone': {
      const ag = await loadAsParty(token, a)
      const mid = idArg(a, 'milestone_id')
      const milestone = ag.milestones?.find((m) => m.id === mid)
      if (!milestone) throw new ArgError('That milestone is not part of this agreement.')
      const label = `"${milestone.title}" (${naira(milestone.amount)}) in "${ag.title}"`

      if (name === 'submit_milestone_evidence') {
        requireRole(ag, 'payee', 'the freelancer')
        const pr = optStr(a, 'pr_url', 10, 500)
        const note = optStr(a, 'note', 2, 1000)
        if (!pr && !note) throw new ArgError('Give a pull request link or a note.')
        return {
          summary: `Submit evidence for ${label}:${pr ? `\n• Pull request: ${pr}` : ''}${note ? `\n• Note: ${note}` : ''}\nEvidence cannot be changed afterwards. ${ASK}`,
          run: async (t) => {
            await amana.submitEvidence(t, mid, { type: pr ? 'GITHUB' : 'UPLOAD', prUrl: pr, screenshots: [], note })
            return `Done. Evidence is submitted for "${milestone.title}".`
          },
        }
      }
      requireRole(ag, 'payer', 'the client')
      if (name === 'approve_milestone') {
        return {
          summary: `Approve ${label}. When all its conditions are met it is paid out to the freelancer. ${ASK}`,
          run: async (t) => {
            await amana.approveMilestone(t, mid)
            return `Done. You approved "${milestone.title}".`
          },
        }
      }
      const reason = str(a, 'reason', 3, 500)
      return {
        summary: `Reject ${label}: "${reason}". ${ASK}`,
        run: async (t) => {
          await amana.rejectMilestone(t, mid, reason)
          return `Done. You rejected "${milestone.title}".`
        },
      }
    }
    default:
      throw new ArgError(`There is no tool called "${name}".`)
  }
}

/** Turns a failure into something the AI can use to fix its call, or throws when the sign-in ended. */
export function failureForAi(error: unknown): { error: string } {
  if (error instanceof ArgError) return { error: error.message }
  if (error instanceof AmanaError) {
    if (error.status === 401) throw new SessionExpired()
    return { error: error.status === 403 ? 'The person has no access to that.' : error.message }
  }
  throw error
}
