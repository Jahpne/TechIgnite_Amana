import { config } from './config.js'

// The fixed messages the bot sends itself. They are written here, not by the AI, so they are always
// the same, always accurate, and always point to the website for the full story.

/** What the bot can do. Short on purpose: the website has the rest. */
export function capabilities(): string {
  return [
    'Here is what I can do:',
    'If you are selling:',
    '• Start a protected order. Tell me the item, the price and the buyer\'s phone number.',
    '• Ask for the item to be collected once the buyer has paid.',
    '',
    'If you are buying:',
    '• Check an order you were sent and what to do next.',
    '• Confirm that the item arrived, or report a problem.',
    '',
    'For both: show your orders, or set up a contract paid in milestones.',
    '',
    `To learn more about Amana: ${config.webUrl}`,
  ].join('\n')
}

/** First contact, before the person has signed in. */
export function welcome(): string {
  return [
    'Hi, I am the Amana assistant. Amana holds a payment until the buyer confirms the delivery, so buyers and sellers can trust each other.',
    '',
    'I can help you:',
    '• sellers: start a protected order for a buyer',
    '• buyers: check an order, then confirm the item arrived or report a problem',
    '• everyone: see your orders and what to do next, or set up a contract paid in milestones',
    '',
    `To learn more: ${config.webUrl}`,
    '',
    'To begin, reply START and I will sign you in with a one-time code.',
  ].join('\n')
}

/** Sent right after a successful sign-in. */
export function signedInMessage(): string {
  return `You are signed in.\n\n${capabilities()}`
}

/** For "hi", "help", "menu", "what can you do" and similar. */
export const GREETING =
  /^(hi|hello|hey|hola|good (morning|afternoon|evening)|help|menu|start|info|options|more info|information|what can you do\??|what do you do\??|how does (this|it) work\??)[.!? ]*$/i
