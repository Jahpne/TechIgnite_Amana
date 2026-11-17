# Amana: Agent Guidelines and Project Instructions

Amana is a two-sided agreement platform (**Agree. Verify. Pay.**): two parties agree on terms, the payer funds the deal, Amana holds the money, and releases it only when the agreed outcome is verified. This is a hackathon build, run on the Paga sandbox.

This is a monorepo: `frontend/amana` (React, Vite), `backend/` (not started yet). `docs/` is local only and git-ignored.

Other documents: [STATE.md](STATE.md) (live hand-off log), `docs/FRONTEND_SPEC.md` (local only, the frontend spec built from the PRD). If a document disagrees with this file, **this file wins**. Where the user's instructions in chat disagree with this file, the user wins.

## Essential Commands

Run these in `frontend/amana`:

* `pnpm dev` starts the Vite dev server at `http://localhost:5173`. If the UI looks stale after installing packages, restart with `pnpm dev --force`.
* `pnpm lint` runs oxlint.
* `pnpm exec tsc -b` type-checks.
* `pnpm build` type-checks and builds the production bundle.

There is no test runner yet. If one is added, run it before finishing any work, and add tests for every new pure rule (for example the milestone amount-sum check).

## Core Architectural Rules

### 1. Frontend structure and ownership
* `src/ui/` holds presentational components. They take props only: no fetching, no routing, no API calls.
* `src/screens/` holds the 12 screens (S1 to S12). Each has a props-only component and a `...Preview` wrapper for the dev gallery at `/gallery`. `src/screens/registry.tsx` lists them and `src/router.tsx` builds the routes from it.
* `src/logic.ts` (and any `api/`, `auth/`, `hooks/` folders) belongs to the **logic workstream**, which is the user's. Do not edit it unless the user asks.
* Styling is Tailwind CSS v4 utilities only. Colour tokens live in `src/index.css` (`bg-surface`, `text-muted`, `bg-brand`, and so on). The theme follows Paga's brand (orange, charcoal, white) and is light only. Use full literal class strings, never built-up class names.
* Routing is TanStack Router with code-based routes. Motion uses `framer-motion` and must respect reduced-motion settings.

### 2. Money and trust rules (the UI must never break these)
* The backend is the source of truth. The UI never decides a status, amount or recipient, and never sends amounts or recipients in request bodies.
* Payment is never confirmed by the client. After Paga returns, show "Verifying payment" until the backend says funded.
* No optimistic updates for status, approval or money.
* The web app never calls `POST /payouts`, `POST /payments/collections` or any `/webhooks/*` endpoint.
* AI never binds anyone. AI-written terms are labelled "Suggested by AI, please review" and need an explicit approval from both parties.
* The agreement detail page always shows one status and one next action for the signed-in user.
* Milestone amounts must sum to the contract total. Approval is blocked when they do not.

### 3. Security
* No secrets in the repo or the browser bundle. Config comes from environment variables (`VITE_` values are public). Never commit `.env` files.
* Render AI and user-supplied text as plain text, never as HTML.
* Evidence uploads have type and size limits and are immutable once attached.
* Keep personal data (phone, name, payout details) out of logs.

### 4. Mobile and accessibility
* Phone first: everything works at 360 px wide. Tap targets are at least 44 px.
* Fields have labels. Colour is never the only status signal. Aim for WCAG AA contrast.

### 5. Language and copy
* Standard English for menus, buttons, statuses, terms, fees, receipts and official notices. No slang or Pidgin carries a factual claim.
* Plain, short, kind wording that reads well on a phone.
* Always state that the demo runs on the Paga sandbox and that production escrow needs a licensed or provider-held arrangement. Never describe a seller's record as a guarantee of trustworthiness.

## Repo Activity Standards

### Git and pull request workflow
1. **Never commit directly to `main`.** Run `git branch --show-current` before every commit. If it says `main`, create a branch first.
2. **Sync, then branch:** start from an up-to-date `main`, then `git checkout -b feat/short-description` (prefix `feat/`, `fix/` or `chore/`).
3. **Tell the user before every commit** and wait, so they can test the change in a browser first. Never commit without their go-ahead.
4. **Commit small, atomic changes.** Stage only the relevant files by name, with clear imperative messages. Never commit secrets, `.env` files, `docs/`, or local tooling folders (`.claude/`, `.agents/`). Commit messages end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
5. **Push the branch only when the user asks:** `git push -u origin <branch>`.
6. **Open a draft pull request** targeting `main` (`gh pr create --draft`) with a summary, the motivation and how it was tested. PR descriptions end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
7. **Never self-merge.** Stop after opening the PR and wait for human review.
8. Never force-push or rewrite history on a shared branch without the user's explicit say-so.

### Before saying work is done
Run `pnpm lint`, `pnpm exec tsc -b` and `pnpm build`, and say plainly if any step was skipped or failed.

## Agent State and Continuity ([STATE.md](STATE.md))
* **Read `STATE.md` at the start of a session** to see where the previous session stopped and what to do next.
* **Never edit `STATE.md` freehand in the middle of work.** Update it at milestones (a step is done, checks are green, or you are stopping): refresh the status, the "where it stopped" notes, the checklist, and add one line to the change log. Keep entries short and factual.
* `STATE.md` is not committed by agents. The user decides when it is committed.
* When several agents run at once, each one owns its own files (see the agent table in `STATE.md`). Two agents never edit the same file.
