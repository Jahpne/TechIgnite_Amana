// Amana frontend logic.
//
// This file is for the logic workstream: API calls, auth, data fetching,
// polling, validation and mutations. Keep UI code out of it.
// Presentational components live in src/ui and only receive props.
//
// Rules from the spec (docs/FRONTEND_SPEC.md):
// - The backend is the source of truth. Never decide status, amounts or recipients here.
// - Never send amounts or recipients in request bodies.
// - No optimistic updates for status, approval or money.
// - Never call POST /payouts, POST /payments/collections or any /webhooks/* endpoint.

