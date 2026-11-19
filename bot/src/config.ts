function text(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

function digits(value: string): string {
  return value.replace(/\D/g, '')
}

export const config = {
  backendUrl: (text('BACKEND_URL') ?? 'https://amana-api.favoursunday.dev').replace(/\/+$/, ''),
  /** Where the web app lives. Used to give people the link to an order. */
  webUrl: (text('PUBLIC_WEB_URL') ?? 'https://amana-web.onrender.com').replace(/\/+$/, ''),
  /** Secret. When absent the assistant is off and the bot only explains how to use the website. */
  aiKey: text('AI_API_KEY') ?? text('GROQ_API_KEY'),
  /** Any OpenAI-compatible service that supports tool calling. Groq by default. */
  aiBaseUrl: (text('AI_BASE_URL') ?? text('GROQ_BASE_URL') ?? 'https://api.groq.com/openai/v1').replace(/\/+$/, ''),
  /** Checked against the provider's model list at start-up. Default: OpenAI's open model on Groq. */
  aiModel: text('AI_MODEL') ?? 'openai/gpt-oss-120b',
  authDir: text('BOT_AUTH_DIR') ?? './auth_state',
  /** Optional. A file that always holds the newest login QR (empty once linked). For showing it on a page. */
  qrFile: text('BOT_QR_FILE'),
  pairingPhone: text('BOT_PAIRING_PHONE') ? digits(text('BOT_PAIRING_PHONE')!) : undefined,
  /** Digits only, no plus sign. Empty means everyone is answered. */
  allowedPhones: new Set((text('BOT_ALLOWED_PHONES') ?? '').split(',').map(digits).filter(Boolean)),
  rateLimitPerMinute: Number(text('BOT_RATE_LIMIT_PER_MINUTE') ?? '8') || 8,
  /**
   * Sandbox only. While the backend returns a debug code with a sign-in request, use it to sign the
   * sender in to their OWN number without waiting for an email. Never turn this on for real users.
   */
  get autoLoginDebug(): boolean {
    return process.env.BOT_AUTO_LOGIN_DEBUG === 'true'
  },
}
