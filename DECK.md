# Amana — presentation content

Slide-ready material. Pricing is a **proposal**, not something the code charges today.

---

## 1. The problem

Two people agree a deal online. Then it stalls.

- The buyer will not pay first — they have been burned, or know someone who has.
- The seller will not ship first — same reason.
- So the deal dies, or one person takes a risk they should not have to.

This is most of Nigerian social commerce. Instagram, WhatsApp, Jiji, X — discovery works
fine. **Trust at the moment of payment is what breaks.**

> Money moves instantly. Trust does not.

---

## 2. What Amana is

**A rail that holds the money until the agreed outcome is verified.**

Agree. Verify. Pay.

- The buyer pays into an account opened for that one deal.
- The money is held — not sent to the seller, not kept by Amana.
- It is released only when the agreed condition is true: delivery confirmed, or a
  milestone approved.
- Either side can raise a problem, and the payout freezes until it is settled.

**We are not a marketplace.** Discovery already works. Amana is the layer underneath,
wherever the deal was agreed.

> Chowdeck moves the goods. Paga moves the money. Amana decides when the money is
> allowed to move.

---

## 3. One engine, two very different deals

| | Protected order | Milestone contract |
| --- | --- | --- |
| Who | A seller and a buyer | A client and a freelancer |
| Example | A phone for ₦180,000 | A website, a wedding shoot, a shop fit-out |
| Proof | Delivered, then buyer confirms | Evidence submitted, then client approves |
| Payment | Once, on confirmation | Per milestone, each released on its own |

Same state machine, same money rules, same audit trail. That is the technical claim worth
making: **one agreement engine serves commerce and services.**

Milestone contracts are for **any** service, not just software. Automated test checking is
an extra for developers, not a requirement.

---

## 4. How a deal runs

1. Seller creates a protected order and sends the link.
2. Buyer opens it, reviews the terms, accepts.
3. Buyer transfers to a dedicated account. **Paga holds it.**
4. Seller hands the item to the courier.
5. Delivery is reported. That is evidence, **not** release.
6. Buyer confirms receipt.
7. The money is charged out of the held account and transferred to the seller's bank.

Every step is written to an append-only log both parties can read.

---

## 5. What makes it trustworthy

These are enforced in code, not in policy:

- **Money moves only from one state.** A payout is impossible from anywhere but RELEASABLE.
- **Funding needs two proofs.** A verified provider callback *and* a server-side check.
- **Amounts and recipients come from the stored agreement**, never from a request.
- **Idempotent payouts.** The key is written before the provider call, so a retry or a
  crash can never pay twice.
- **A dispute locks the payout.** Checked on every attempt.
- **Verified payout accounts.** We ask the bank for the account holder's name and make the
  seller confirm it before any money is sent.
- **AI binds nobody.** Suggested terms are schema-validated and need both approvals.

---

## 6. Architecture

```
WhatsApp bot        Web app          Partner API (next)
       \               |               /
        \              |              /
              Amana backend (NestJS)
   AI compiler · Agreements · OutcomeOS · Payments · Disputes
        /              |               \
   GitHub/CI       Chowdeck           Paga Engine
   (evidence)      (delivery)      (holds and moves money)
```

Every rule lives in the backend. The chat bot, the web app and a future partner API are
thin front doors over the same engine — which is why a marketplace could integrate Amana
without us rebuilding anything.

---

## 7. Technology

| Layer | Choice |
| --- | --- |
| Web app | React 19, TypeScript, Vite, TanStack Router + Query, Tailwind CSS |
| Backend | NestJS, TypeScript, REST + webhooks, OpenAPI |
| Database | PostgreSQL (Neon), Prisma |
| Queue and jobs | Redis (Upstash), BullMQ |
| Payments | **Paga Engine** — subsidiary accounts hold funds, depositToBank releases |
| Delivery | Chowdeck Relay — quote, dispatch, status webhooks |
| AI | OpenRouter, schema-validated JSON, deterministic fallback |
| Email | Resend |
| Hosting | LiteHost, GitHub auto-deploy, HTTPS |

**Why Paga subsidiary accounts matter:** each agreement gets its own ledger-backed account,
so funds sit with Paga until released. Amana never holds customer money in its own balance
— which is the difference between a product and a licensing problem.

---

## 8. Status — what actually works

| | |
| --- | --- |
| Agreement engine, state machine, audit log | Working, 50 tests on the money paths |
| Deployed API with live OpenAPI docs | Working |
| Paga: held accounts, balance checks, charge, payout | Proven against the sandbox |
| AI milestone compiler | Working, on a free model |
| Web app, both flows end to end | Working |
| Email one-time codes | Working |
| Chowdeck delivery | Adapter built, awaiting credentials |
| WhatsApp bot | Logic built and tested, awaiting a Business number |

---

## 9. Pricing (proposal)

Nobody pays to *create* an agreement. We charge only when money is released, because that
is the moment Amana has actually done its job.

| Plan | Fee | Who pays |
| --- | --- | --- |
| Protected order | **2% of the deal, capped at ₦5,000** | Seller, by default |
| Milestone contract | **2%, charged per milestone released** | Client or freelancer, set in the terms |
| Deals under ₦5,000 | **Free** | — | 
| Partner API | **1% + volume pricing** | The platform |

Rationale worth saying out loud:

- **Charging on release aligns us with the user.** No release, no fee. We are paid for an
  outcome, not for holding money.
- **A cap keeps big deals viable.** A flat percentage on a ₦2m deal would push people back
  to direct transfer, which is the behaviour we are trying to replace.
- **Small deals free** buys the habit. The ₦2,000 transaction is where trust is cheapest to
  prove and where word of mouth starts.
- **The fee is a term of the agreement**, so both parties see it before they approve —
  consistent with the rest of the product.

Cost to serve is the Paga collection and transfer fees, so the margin is the spread between
2% and those fees, which favours us as deal size grows.

---

## 10. Why this wins

- **Discovery is solved; trust is not.** We are not fighting Instagram or Jiji, we sit under them.
- **One engine, two markets.** Commerce and services from the same backend — nobody else is
  doing both.
- **Escrow as a rail.** The same API that serves our app can serve a marketplace, a
  classifieds site, an agency platform.
- **Built on local rails.** Paga for money, Chowdeck for delivery — not a foreign stack
  retrofitted to Nigeria.

---

## 11. What's next

1. **Partner API** — API keys, acting on behalf of a platform's users, outbound webhooks.
2. **Open order links** — sell to whoever opens the link, not only a named buyer.
3. **WhatsApp bot live** — the entry point most Nigerian sellers already live in.
4. **Chowdeck live** — delivery evidence without anyone typing anything.
5. **Licensing path** — production escrow needs a licensed or provider-held safeguarding
   arrangement. Paga's held accounts are the right foundation for that conversation.

---

## 12. The one-liner

> **Amana holds the money until both sides are happy.**
> One engine for a phone sale and a freelance contract, built on Paga.
