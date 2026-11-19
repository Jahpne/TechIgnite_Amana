# Amana WhatsApp bot

An assistant on WhatsApp for Amana. It links a WhatsApp number with [Baileys](https://github.com/WhiskeySockets/Baileys).
An AI model reads what people write and uses **tools** to do things for them. Each tool is a real Amana endpoint, called
as the person who is chatting. By default the model is OpenAI's open model, `gpt-oss`, hosted on [Groq](https://groq.com).
Any OpenAI-compatible service that supports tool calling works.

> **Read this first.** Baileys is an *unofficial* library: it signs in as a linked device, the way WhatsApp Web
> does. It is not the WhatsApp Business Platform that the product plan names. WhatsApp can restrict or ban a number
> that is used this way. **Use a spare number you can afford to lose, never a personal one,** and move to the
> official Business Platform before real customers depend on this.

## How it works

```
WhatsApp message
      |
      v
  Rate limit, allow-list, one message at a time per person
      |
      v
  Not signed in?
      |-- first contact -> a short welcome: what the bot can do + the website link. Nothing is emailed yet.
      '-- next message  -> sign in by code (below), then carry on
      |
      v
  "hi", "help", "menu", "what can you do"?  -> the fixed list of what it can do + the website link (no AI)
      |
      v
  An action is waiting for a 1?
      |-- reply "1"   -> run it, as the person
      |-- reply "2"   -> cancel it
      '-- anything else -> start a new request
      |
      v
  The AI works out what the person wants and calls tools:
      read tools   -> run at once: list orders, get one, history, payment status, propose contract terms
      write tools  -> NEVER run by the AI. The bot checks the details, writes a confirmation itself,
                      and runs the call only when the person replies 1
```

### Signing in

Amana signs people in with a one-time code that the backend emails. The bot does this in the chat:

1. After the welcome, the person's next message makes the bot ask the backend to send a code. It says where it went (a masked address). Nobody gets a code email before they have seen the welcome.
2. The person replies with the 6-digit code. The bot gets that person's own token. It is kept in memory only, never on disk.
3. A brand-new number is asked for an email address first (the backend only accepts one for a new account).

Every call after that uses the person's own token, so the backend decides who may do what. The bot holds no master key.

### What it says about itself

The welcome, the "what I can do" list and the website link (`PUBLIC_WEB_URL`) are fixed messages in `src/messages.ts`,
not written by the AI, so they are always the same and always accurate. The AI is also told never to assume the person
wants an order: when someone is unsure or asks for something it cannot do, it lists what it can help with and gives the link.

### The tools (the endpoints)

| Tool | Endpoint | Needs a 1 |
| --- | --- | --- |
| `list_my_agreements` | `GET /agreements` | no |
| `get_agreement` | `GET /agreements/{id}` | no |
| `get_agreement_history` | `GET /agreements/{id}/timeline` | no |
| `get_payment_status` | `GET /payments/{id}` | no |
| `propose_contract_terms` | `POST /agreements/compile` (a proposal only) | no |
| `create_protected_order` | `POST /agreements` | yes |
| `create_contract` | `POST /agreements/milestone` | yes |
| `approve_terms` | `POST /agreements/{id}/approve` | yes |
| `hand_item_to_delivery` | `POST /agreements/{id}/delivery` | yes |
| `confirm_receipt` | `POST /agreements/{id}/confirm` (CONFIRM) | yes |
| `report_problem` | `POST /agreements/{id}/confirm` (PROBLEM) | yes |
| `open_dispute` | `POST /agreements/{id}/dispute` | yes |
| `submit_milestone_evidence` | `POST /milestones/{id}/evidence` | yes |
| `approve_milestone` | `POST /milestones/{id}/approve` | yes |
| `reject_milestone` | `POST /milestones/{id}/reject` | yes |

Admin endpoints, payouts and webhooks are not tools. Nobody can rule on a dispute or trigger a payout from chat.

### What keeps money safe

- **The AI cannot run an action.** When it asks for one, the bot validates the details (ids must come from the
  tools, amounts are whole naira, roles are checked) and writes the confirmation **itself**, so the AI cannot
  misdescribe what will happen. Only the person's own `1` runs it. "yes" is not a confirmation. One action at a time.
- A request that waits more than 10 minutes expires. Any other message cancels it.
- Facts come from tool results. The AI is told not to describe how money is stored, and the bot checks every answer:
  if the AI asks the person to reply 1 itself, or claims things like a "protected account", it is told to correct
  itself once, and if it does it again the bot answers instead. Markdown is stripped for WhatsApp.
- Text in order titles, notes and so on is treated as data, not as instructions.

## Setup

You need Node 20 or newer and pnpm.

```bash
cd bot
pnpm install
cp .env.example .env     # then fill it in
pnpm start
```

Settings in `.env` (see `.env.example`):

| Name | What it is |
| --- | --- |
| `BACKEND_URL` | The Amana backend. Defaults to the staging API. |
| `PUBLIC_WEB_URL` | The web app. Used for the order link the bot sends. Defaults to the Render site. |
| `AI_API_KEY` | A key from your AI provider. Without it the bot still signs people in, but says its assistant is off. Keep it in `.env`, never in chat or code. (`GROQ_API_KEY` also works.) |
| `AI_BASE_URL` | The provider's OpenAI-compatible address. Defaults to Groq. For OpenAI itself use `https://api.openai.com/v1`. |
| `AI_MODEL` | The model id. Defaults to `openai/gpt-oss-120b`. It must support tool calling. At start-up the bot checks it against your account and lists the models you can use if it is wrong. |
| `BOT_ALLOWED_PHONES` | Optional comma-separated allow-list. **Use it while testing.** |
| `BOT_AUTO_LOGIN_DEBUG` | **Sandbox only.** `true` signs a sender in to their own number with the backend's debug code, skipping the email. Never turn it on for real users. |
| `BOT_QR_FILE` | Optional. A file that always holds the newest login QR (empty once linked), so a web page can show it. |
| `BOT_PAIRING_PHONE` | Optional. Link with a pairing code instead of a QR code. |
| `BOT_RATE_LIMIT_PER_MINUTE` | Messages per person per minute. Default 8. |

### Linking the number

Run `pnpm start`. The first time, a QR code appears in the terminal. On the phone with the spare number open
**WhatsApp > Linked devices > Link a device** and scan it. (With `BOT_PAIRING_PHONE` set, it prints an
8-character code instead: **Linked devices > Link with phone number instead**.)

The login is saved in `auth_state/`. That folder is git-ignored. **Anyone who has it can act as that number**, so
keep it private. To start over, stop the bot, delete `auth_state/` and link again.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm start` | Run the bot. |
| `pnpm dev` | Run it and restart on code changes. |
| `pnpm typecheck` | Check the types. |
| `pnpm test` | Run the logic tests. They use a fake Amana backend and a fake AI service, so they need no keys or network. |

## Known limits

- **Real people need an email on file** to get a code, because that is how the backend delivers them. An existing
  account with no email cannot sign in here. Ask the Amana team to add one, or sign in on the website.
- **Free AI plans have tight per-minute limits.** The bot waits and retries once, then says it is busy.
- **In-memory sessions.** A restart signs everyone out and forgets half-finished requests.
- **No pushed notifications.** The bot only answers messages. "Payment received" style messages need the backend's own sender.
- **Voice notes, images and groups are ignored.** Groups and broadcasts are never answered.
- **Evidence by link or note only.** The backend has no file upload endpoint.
- The Baileys release in use is `7.0.0-rc14`, a release candidate.
