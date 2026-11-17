# Agent State and Hand-off Log (STATE.md)

This file tracks the active goal, work done, current progress and exact continuation steps across sessions.

**Read this first. Update it only at milestones, following [AGENTS.md](AGENTS.md).**

---

## 1. Current Session and Status

* **Status:** In progress. The frontend UI is built and styled. The logic workstream (the user's) is under way. The backend has not started.
* **Last Updated:** 2026-11-17
* **Active Goal:** Hackathon demo of one agreement engine serving two deals (TradeProof and milestone contract), with a web app, a WhatsApp bot and a payments backend.
* **Checks at last run:** `pnpm lint`, `pnpm exec tsc -b` and `pnpm build` passed on 2026-11-17 (landing page work). There is no test runner yet.

---

## 2. Where the Previous Session Stopped

* **On `origin/main`:** the Vite and React scaffold, Tailwind v4 and TanStack Router setup, the base UI components (`src/ui/`), mock data, all 12 screens (S1 to S12) with preview wrappers, the router and the dev gallery. (Two commits, `c2d32d0` and `de01934`; the user made the first.)
* **On branch `feat/landing-page` (committed `b7aa8c3`, not pushed):** the landing page at `/`, the gallery moved to `/gallery`, the Paga-style light theme (white page, peach hero, black-to-navy section, pill buttons) and framer-motion animations.
* **Not done:** the logic layer (`src/logic.ts` is an empty placeholder), real routing guards, the API client, the `backend/` folder (empty placeholder), the WhatsApp and Discord bots, and the Paga, Chowdeck and GitHub integrations.
* **Known quirk:** after installing packages, the dev server can show an "Invalid hook call" error from `framer-motion` until restarted with `pnpm dev --force`. The production build is not affected.

---

## 3. Where to Continue From (Next Steps)

1. The user tests `feat/landing-page` in a browser. When they approve, push it and open a **draft PR** into `main`. Never self-merge.
2. The user's logic workstream: `config.ts`, API client, auth and session, `beforeLoad` route guard, then replace each screen's `...Preview` in the registry with a real page that supplies data and handlers.
3. Restyle the 12 app screens to match the landing page (pill buttons, Paga look) if the user wants it.
4. Backend: agreement CRUD, status enum and transitions, OpenAPI spec and a fake payment mode first, then real Paga calls.

---

## 4. Plan and Task Checklist

- [x] README and frontend spec written from the PRD (`docs/` is local only).
- [x] Tailwind v4 and TanStack Router set up.
- [x] Base UI components (Tailwind, props only).
- [x] Mock data and dev gallery.
- [x] Screens S1 to S12 built with previews.
- [x] Landing page with Paga-style theme and motion (committed on `feat/landing-page`).
- [ ] Draft PR for `feat/landing-page` (waiting for the user to test and approve a push).
- [ ] Logic: config, API client, auth, route guards, data hooks.
- [ ] Restyle app screens to match the landing page.
- [ ] Backend: agreements, state machine, fake payment mode, OpenAPI spec.
- [ ] Paga collections, callbacks, payout guard, reconciliation.
- [ ] WhatsApp bot, Discord ops server, Chowdeck adapter.
- [ ] Edge-case tests and two clean demo runs.

---

## 5. Architectural Context and Decisions

* **Monorepo:** `frontend/amana`, `backend/` (empty), `docs/` (local only, git-ignored; an older commit of the spec is still in remote history).
* **Ownership:** the user owns `src/logic.ts` and everything under the logic workstream. UI agents never edit it.
* **Styling:** Tailwind v4 utilities, tokens in `src/index.css`, light only, Paga-style palette (orange `#F26522`, charcoal `#231F20`, peach tint, navy gradient section).
* **Routing:** TanStack Router, code-based routes built from `src/screens/registry.tsx`. Links to those routes use plain `<a href>` because the routes are generated in a loop and are not typed.
* **Money rules:** the backend decides status, amounts and recipients. The UI never confirms payment or calls payout or webhook endpoints.
* **Git workflow (decided 2026-11-17):** never commit to `main`, use a `feat/` branch, tell the user before each commit so they test in a browser first, push only when asked, draft PR, never self-merge.
* **Open questions (from the PRD):** whether Paga holds funds until release, whether Chowdeck webhooks are available or must be simulated, the auto-release window, whether Discord is also a customer channel, Next.js versus staying on Vite, and the final status enum from the backend.

---

## 6. Log of Changes

| Date | Agent / Action | Summary of Changes |
| :--- | :--- | :--- |
| 2026-11-17 | claude | README, frontend spec, UI components, 12 screens, router, mocks, gallery built. Committed and pushed to `main` as `de01934` (should have been a branch). |
| 2026-11-17 | claude | Landing page, `/gallery` move, Paga-style light theme and motion. Committed on `feat/landing-page` as `b7aa8c3`; `main` reset to `origin/main`. |
| 2026-11-17 | claude | Created `AGENTS.md` and `STATE.md` from the relevant rules in the campusLife project. |

---

## 7. Agents (live)

| Agent | Status | Owns | Updated |
| :--- | :--- | :--- | :--- |
| ui-components | finished | `src/ui/*` | 2026-11-17 |
| ui-preview | finished | `src/mocks/data.ts`, `src/screens/registry.tsx`, `src/router.tsx` | 2026-11-17 |
| screens-trade | finished | `src/screens/trade/*` (S1 to S5) | 2026-11-17 |
| screens-contract | finished | `src/screens/contract/*` (S6 to S9) | 2026-11-17 |
| screens-admin | finished | `src/screens/lists/*` (S10 to S12) | 2026-11-17 |
| logic (the user) | in progress | `src/logic.ts` and the logic folders | 2026-11-17 |
