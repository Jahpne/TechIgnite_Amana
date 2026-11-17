# Amana Frontend Spec

Source: *Amana PRD & Build Workflow* (Nov 14, 2026). This spec covers the **web app** (workstream B). Section references like "PRD §9" point to that document.

Tagline: **Agree. Verify. Pay.**

## 1. Purpose and scope

The web app is where payment, terms review, evidence and milestone work happen. WhatsApp and Discord are separate front doors. The web app is a thin client over the one backend: it never talks to Paga, Chowdeck or GitHub directly, never moves money, and never receives webhooks.

**In scope (workstream B):**
- All screens in §4
- AI Agreement Compiler UI (prompt input, schema-validated result, editable fields)
- GitHub evidence submission and milestone approval UI
- Admin dispute page
- OutcomeOS rules for milestones are co-owned with this workstream (PRD §12). The UI only displays their results.

**Out of scope:** WhatsApp/Discord bots, payments engine, state machine, Chowdeck adapter, public developer API, multi-currency, seller reputation scores, AI dispute rulings.

## 2. Principles

1. **Mobile first.** Buyers arrive from a WhatsApp link. Everything must work at **360 px** wide.
2. **One status, one next action.** The agreement detail page always shows the current status and the single next action for the signed-in user.
3. **The backend is the source of truth.** The UI never decides a status, an amount or a recipient. It renders what `GET /agreements/:id` returns and never sends amounts or recipients in request bodies.
4. **Payment is never client-confirmed.** After Paga returns, show "verifying payment" until the backend says `FUNDED`. There is no "I paid" action.
5. **AI never binds anyone.** AI-generated terms are labelled "suggested by AI, please review". Approval is always an explicit per-party button.
6. **Plain language.** Terms and statuses are written for non-technical users.
7. **Honest about the sandbox.** The app states clearly that the hackathon runs on a sandbox and that production escrow needs a licensed or provider-held arrangement.

## 3. Users and roles

Every agreement has two human parties. The UI adapts per signed-in user.

| Role | Also called | Trigger held | Web screens |
| --- | --- | --- | --- |
| Seller / Freelancer (payee) | Vendor, developer | Delivery: ships goods or submits proof | Create order, hand to Chowdeck, submit milestone evidence |
| Buyer / Client (payer) | Customer, business | Funding and release: pays, confirms, approves | Order link, pay, confirm or dispute, new contract, approve milestone |
| Admin / Reviewer | Amana team member | Resolves disputes, approves manual-review milestones | Admin disputes |

System actors (Chowdeck, Paga, GitHub/CI) have no UI. The user sees only their effects (status changes and evidence on the timeline).

**Key principle:** the buyer holds the release trigger, the seller holds the delivery trigger, and no single party can move money alone. The UI must never offer a party an action that belongs to the other.

## 4. Screens

Priorities: **P0** = must work in the demo, **P1** = if time allows.

| # | Screen | User | Purpose | Priority |
| --- | --- | --- | --- | --- |
| S1 | Sign in with phone (OTP) | All | Identity for both parties | P0 |
| S2 | Order link page | Buyer | See terms, accept, pay via Paga | P0 |
| S3 | Create order | Seller | Item, price, buyer phone, delivery terms | P0 |
| S4 | Agreement detail | Both | Status timeline, evidence, actions available now | P0 |
| S5 | Confirm or report delivery | Buyer | Confirm receipt, or open dispute with reason and photo | P0 |
| S6 | New contract (AI) | Client | Describe project, see AI-proposed milestones | P0 |
| S7 | Review and edit terms | Both | Edit milestones, amounts, conditions; approve | P0 |
| S8 | Submit milestone evidence | Freelancer | GitHub PR link, screenshots, notes | P0 |
| S9 | Approve milestone | Client | See evidence and test result; approve or reject | P0 |
| S10 | My agreements | All | List with status filters | P0 |
| S11 | Admin: disputes | Admin | Both sides' evidence; rule release or refund | P1 |
| S12 | Receipt | Both | Summary of amounts, parties, events | P1 |

### S1. Sign in (phone OTP)
- Phone number input, then a 6-digit OTP entry. Phone OTP is the only login. No passwords.
- Order links work for new users: opening the link prompts OTP, then continues to the order. A lightweight account is created on first sign-in.
- States: entering phone, sending, entering code, wrong or expired code, resend (with cooldown), rate-limited.

### S2. Order link page (buyer)
- Shows seller name, item, price, delivery terms, expiry, and the sandbox notice.
- Actions by state:
  - `AWAITING_ACCEPTANCE` or equivalent: **Accept terms** button.
  - `AWAITING_PAYMENT`: **Pay with Paga** button opens Paga's flow.
  - After return from Paga: "Verifying payment" state, polling until `FUNDED` (see §7).
  - Expired: clear expired message, no actions.
- Buyer must be signed in (S1) before accepting.

### S3. Create order (seller)
- Fields: item, price (NGN), buyer phone, delivery terms.
- Validation: price is a positive integer, buyer phone is a valid number, all fields required.
- On submit, call `POST /agreements`, then show the generated order link with copy and share actions ("Link ready").

### S4. Agreement detail
- Header: agreement title, type (Trade or Milestone), counterparty, total amount, current status.
- **Next-action panel:** exactly one primary action for the signed-in user, or a plain "Waiting for [other party]" message. The action comes from `next_action` in the API response. The client never derives it from status alone.
- Parties panel: who has approved which version.
- Terms (versioned, with AI labelling where relevant).
- Milestones (milestone type only), each with its own status.
- Evidence list (Chowdeck delivery, GitHub PR and test results, uploads, buyer confirmation). Evidence is read-only once attached.
- **Status timeline:** the backend audit log, read-only. Each entry shows who, what, when, and a link to evidence.
- Dispute banner when `dispute_lock` is true: "Payout is paused while this is reviewed".

### S5. Confirm or report delivery (buyer)
- Appears when status is `DELIVERED`. Shows Chowdeck delivery evidence and the auto-release deadline if configured (P1).
- Two actions: **Confirm receipt** and **Report a problem** (reason text plus photo upload).
- Confirming requires a confirmation step ("Release payment to the seller?").
- Reporting calls `POST /agreements/:id/dispute` and shows the locked state.

### S6. New contract (AI compiler, client)
1. Client types the project in plain language.
2. Call `POST /agreements/compile`. Show a loading state.
3. Render the structured result as editable fields (see S7).
4. Reject and surface an error if the backend returns invalid output or amounts that do not sum to the total.
- Include a counterparty field (freelancer phone).

### S7. Review and edit terms
- Editable fields: contract total, milestones (title, amount, conditions, verification method), dispute terms.
- Every AI-generated term carries the label **"suggested by AI, please review"** until edited and approved.
- **Amounts must sum to the contract total. The form blocks approval if they do not**, and shows the difference.
- Any edit calls `PATCH /agreements/:id/terms` and creates a new version. **Both parties must approve the latest version.** An edit after one party approved clears that approval, and the UI says so before saving.
- Approval is an explicit button per party. The page shows who has approved which version.
- Funding is not offered until both have approved (Both-parties-dispute-the-terms edge case: terms not approved, no funding possible).
- After both approve, the client sees **Fund contract** (full amount via Paga), then the same "Verifying payment" state as S2.

### S8. Submit milestone evidence (freelancer)
- Fields: GitHub PR link (validated URL), screenshots (upload), notes.
- Upload limits: allowed types (images and PDF) and a max size, enforced client side and by the backend. Show the limits up front.
- Submit calls `POST /milestones/:id/evidence`. Show the milestone as `MILESTONE_SUBMITTED` with OutcomeOS check status.
- Evidence cannot be edited or deleted after submission. Say so before submit.

### S9. Approve milestone (client)
- Shows evidence, the GitHub PR, the CI test result, and the OutcomeOS state: **Verified, Awaiting evidence, Needs human review, Failed, Disputed**.
- Actions: **Approve** (`POST /milestones/:id/approve`) or **Reject / open dispute**.
- Show the required conditions as a checklist (e.g. "Tests pass", "Client approval"). **A milestone is paid only when all conditions are true.** Passing tests alone do not release money if client approval is required, and the UI makes that visible.

### S10. My agreements
- List of agreements the user is party to, with status filters (e.g. Needs my action, Awaiting payment, In progress, Completed, Disputed, Expired).
- Each row: counterparty, amount, status, next action label.
- Empty state with create-order and new-contract entry points.

### S11. Admin: disputes (P1)
- Admin-only. List of open disputes, then a detail view with both sides' evidence side by side.
- Actions: **Rule release** or **Rule refund**, with a required note. Calls `POST /admin/disputes/:id/rule`.
- Also handles milestones flagged "Needs human review".
- No AI rulings. AI may organise evidence, but a human decides.

### S12. Receipt (P1)
- Summary of amounts, parties, key events and payout reference. Available to both parties at completion. Printable and shareable.

## 5. Status model (UI view)

The UI imports the status enum and transitions from the backend (owned by workstream C). It must not define its own. Statuses named in the PRD:

`DRAFT`, `AWAITING_PAYMENT`, `FUNDED`, `IN_DELIVERY`, `DELIVERED`, `RELEASABLE`, `DISPUTED`, `COMPLETED`, plus milestone-level `IN_PROGRESS`, `MILESTONE_SUBMITTED`, `RELEASABLE`, `PAYING_OUT`, and explicit pending states `Payment pending`, `Payout pending`, `Payout failed`.

The PRD calls the lifecycle "9 states, dispute lock". Confirm the final enum with workstream C and generate the UI types from the OpenAPI spec.

Every status needs: a plain-language label, a colour/icon treatment, and a description for each party. Pending and failed states must be explicit, never hidden behind a spinner.

| Status | Buyer sees | Seller sees |
| --- | --- | --- |
| `DRAFT` | Invitation to review | Link ready |
| `AWAITING_PAYMENT` | Pay now | Buyer accepted, waiting for payment |
| `FUNDED` | Payment confirmed | Funds held, ship now |
| `IN_DELIVERY` | Item on the way | Delivery tracking |
| `DELIVERED` | Please confirm | Awaiting buyer confirmation |
| `RELEASABLE` | Releasing payment | Payout about to be sent |
| `DISPUTED` | Under review | Under review |
| `COMPLETED` | Receipt | Payout sent, receipt |

## 6. Components and UX rules

- **StatusBadge**, **NextActionPanel**, **Timeline** (audit log), **TermsView**, **MilestoneCard**, **EvidenceItem**, **ApprovalIndicator**, **AmountInput** (NGN, integer), **PhoneInput**, **OtpInput**, **FileUpload** (limits shown), **ConfirmDialog**, **SandboxBanner**, **AiSuggestionLabel**.
- Tap targets at least 44 px. Single column on mobile. Avoid horizontal scroll at 360 px.
- Money is always shown with currency (₦ / NGN), thousands separators, and no floating point rounding. Treat amounts as integers.
- Destructive or irreversible actions (confirm receipt, approve milestone, accept terms, submit evidence) use a confirmation step that states the consequence.
- Accessibility: keyboard navigable, visible focus, labels on all fields, colour never the only status signal, WCAG AA contrast.
- A persistent **sandbox notice** on payment-related screens: "Demo runs on the Paga sandbox. No real money moves."
- Copy tone: short, plain, no jargon. Avoid describing a seller's record as a guarantee of trustworthiness.

## 7. Data fetching and state

- API client generated from the **OpenAPI spec** (workstream C writes it first). Until the backend exists, develop against a **mock server** from that spec.
- **Fake payment mode** (backend env flag) lets the UI demo `FUNDED` and payout before Paga is live. The UI needs no special code path for it.
- **Polling:** after a Paga return, poll `GET /agreements/:id` (or `GET /payments/:agreementId`) every 2 to 3 seconds, with backoff and a timeout that shows "Still verifying. You can leave this page; we'll notify you." The target is webhook-to-state update under 5 seconds.
- Refetch the agreement on window focus and after every mutation. Use the server response as the new state.
- Optimistic updates are not allowed for anything involving status, approval or money.
- Handle idempotent retries safely: disable submit buttons while in flight, and never resubmit on a timeout without refetching first.

### API surface used by the web app

| Method and path | Used by |
| --- | --- |
| `POST /agreements` | S3 |
| `POST /agreements/compile` | S6 |
| `GET /agreements/:id` | S2, S4, S5, S7, S9 |
| `PATCH /agreements/:id/terms` | S7 |
| `POST /agreements/:id/approve` | S2, S7 |
| `POST /agreements/:id/delivery` | S4 (seller hands item to Chowdeck) |
| `POST /agreements/:id/confirm` | S5 |
| `POST /agreements/:id/dispute` | S5, S9 |
| `POST /milestones/:id/evidence` | S8 |
| `POST /milestones/:id/approve` | S9 |
| `POST /admin/disputes/:id/rule` | S11 |
| `GET /payments/:agreementId` | S2, S7 (verifying state) |

The web app must **not** call `POST /payouts`, `POST /payments/collections`, or any `/webhooks/*` endpoint.

### AI compiler contract

```json
{
  "total_amount": 100000,
  "currency": "NGN",
  "milestones": [
    {"title": "Homepage completed", "amount": 50000, "conditions": ["client_approval"], "verification": "client_approval"},
    {"title": "Website deployed", "amount": 50000, "conditions": ["tests_pass", "client_approval"], "verification": "automated_test"}
  ],
  "required_approvals": ["payer", "payee"],
  "dispute_terms": "Payout paused; admin reviews evidence from both parties"
}
```

The UI treats this as untrusted input. It validates shape and the amount-sum rule locally for fast feedback, but the backend is authoritative.

## 8. Flows to support end to end

**Flow 1, TradeProof:** S3 create order → S2 buyer accepts and pays → S4 funded and in delivery → S5 buyer confirms → S4/S12 completed with receipt.

**Flow 2, milestone contract:** S6 describe project → S7 review, edit, both approve → fund → S8 evidence → S9 approve milestone → payout, repeat per milestone.

**Flow 3, WhatsApp quick order:** the order link in the WhatsApp message opens S2. From there it is Flow 1. The web app must render an agreement created by the bot unchanged (`created_via = whatsapp`).

## 9. Security (frontend responsibilities)

- Phone OTP session. Every API call is authenticated, and the UI hides actions for non-parties. The backend enforces it.
- No secrets in the repo or bundle. Config through environment variables.
- Never send amounts or recipients from the client. Read them from the stored agreement.
- Render AI output as text, never as HTML.
- Validate and limit evidence uploads (type, size). Evidence is immutable once attached.
- Do not log personal data (phone, name, payout details) to the console or analytics.
- Escape user-supplied text (item names, notes, dispute reasons) everywhere it is shown.

## 10. Edge cases the UI must handle

| Situation | UI behaviour |
| --- | --- |
| Buyer never pays | Order shows expired; seller sees expiry |
| Paga return with no callback yet | "Verifying payment" with polling and timeout message |
| Payment amount mismatch | Stays unfunded; show "We could not confirm this payment" with support path |
| Payout pending / failed | Explicit status with explanation; no retry button for users |
| Chowdeck says delivered, buyer says no | Buyer reports a problem; payout locked banner |
| Delivery failed or returned | Agreement shown as on hold; seller and admin alerted |
| Buyer silent after delivery | Show auto-release deadline (P1) |
| Seller never ships after funding | Buyer can request refund after the stated deadline |
| Milestone tests pass, client rejects | Stays unreleased; offers dispute |
| Both parties dispute AI terms | Terms not approved; funding blocked |
| Edit after one approval | Approval resets; UI warns before saving |
| Network error / double click | Disabled in-flight buttons; refetch before retry |

## 11. Technical approach

- **Current repo:** `frontend/amana` is React 19, TypeScript, Vite and pnpm, with `framer-motion` installed. Scripts: `dev`, `build`, `lint` (oxlint), `preview`.
- **PRD suggestion:** Next.js, TypeScript, Tailwind CSS. The team should decide early whether to migrate or keep Vite. Keeping Vite is fine if routing, data fetching and styling are added. Suggested additions if staying on Vite: React Router, TanStack Query, Tailwind CSS, a form library with schema validation (e.g. Zod), and a generated OpenAPI client.
- Responsive design verified at 360 px, plus a desktop layout for admin screens.
- Animation (framer-motion) is used for state transitions only. Respect `prefers-reduced-motion`.

### Suggested route map

| Route | Screen |
| --- | --- |
| `/signin` | S1 |
| `/o/:agreementId` | S2 order link page |
| `/orders/new` | S3 |
| `/agreements` | S10 |
| `/agreements/:id` | S4 |
| `/agreements/:id/confirm` | S5 |
| `/contracts/new` | S6 |
| `/agreements/:id/terms` | S7 |
| `/milestones/:id/evidence` | S8 |
| `/milestones/:id/review` | S9 |
| `/admin/disputes` and `/admin/disputes/:id` | S11 |
| `/agreements/:id/receipt` | S12 |

## 12. Build order and gates (workstream B)

| Phase | Frontend work | Gate |
| --- | --- | --- |
| 0. Setup | App shell, design basics, routing, API client against mock server | Everyone builds against the same spec |
| 1. Skeleton | S2 order link page, S4 agreement detail, S3 create order | Create an order and walk it to Completed with fake payment |
| 2. Real money | Pay flow with Paga, verifying state | One sandbox payment reaches Funded |
| 3. Delivery and verify | S5 buyer confirm and dispute | TradeProof end to end on WhatsApp plus web |
| 4. Milestones | S6, S7, S8, S9, GitHub check display | Milestone contract end to end |
| 5. Polish | S11 admin disputes, S12 receipts, edge cases | Two clean demo runs in a row |

Handoffs from workstream C (needed first): OpenAPI spec, status enum and transitions, event payloads, fake payment switch. Changes to the status enum or API go through C.

## 13. Acceptance criteria (demo)

- Seller creates a 180,000 order on the web, and the buyer's order link page renders on a 360 px screen.
- Buyer accepts, pays in the Paga sandbox, sees "Verifying payment", then `FUNDED` within seconds of the backend confirming.
- Agreement detail always shows one status and one next action for the signed-in user.
- Buyer confirms receipt. Payout fires once. The UI offers no way to trigger a second payout.
- Timeline matches the audit log. Receipt shows amounts, parties and events.
- Client describes a project, sees AI milestones labelled "suggested by AI, please review", edits amounts, and is blocked when amounts do not sum to the total.
- Both parties approve the latest version. Editing resets approvals.
- Freelancer submits a GitHub PR and screenshots. The client sees the test result and approves. The milestone payout runs.
- Opening a dispute shows the payout-locked banner to both parties.

## 14. Open questions affecting the frontend

- Does the buyer need a full account, or is phone OTP on the order link enough? (PRD recommends OTP only.)
- Auto-release window (e.g. 24 or 48 h) and unpaid-order expiry. These affect the countdown and expiry copy.
- What does Paga's checkout look like: redirect, popup or embedded? This affects the return-and-verify flow.
- Does Chowdeck provide real webhooks, or is delivered simulated? If simulated, the UI may need a demo-only "simulate delivery" control behind an env flag.
- Is Discord a customer channel too? (Affects the notification copy on the web.)
- Keep Vite or move to Next.js?
- Who owns the AI compiler and OutcomeOS? (PRD recommends the web teammate.)
- Final status enum (PRD says 9 states) and next-action values from workstream C.
