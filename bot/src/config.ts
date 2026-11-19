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

  /** The official WhatsApp Business Platform (Cloud API), used when the bot runs as a webhook. */
  get whatsapp() {
    return {
      verifyToken: text('WHATSAPP_VERIFY_TOKEN'),
      appSecret: text('WHATSAPP_APP_SECRET'),
      token: text('WHATSAPP_TOKEN'),
      phoneNumberId: text('WHATSAPP_PHONE_NUMBER_ID'),
      apiBase: (text('WHATSAPP_API_BASE') ?? 'https://graph.facebook.com/v21.0').replace(/\/+$/, ''),
    }
  },

  /** Where people's chat state is kept between messages when the bot runs serverless. Empty means memory. */
  get redis() {
    const url = text('UPSTASH_REDIS_REST_URL') ?? text('KV_REST_API_URL')
    const token = text('UPSTASH_REDIS_REST_TOKEN') ?? text('KV_REST_API_TOKEN')
    return url && token ? { url: url.replace(/\/+$/, ''), token } : undefined
  },
  /** Encrypts what is stored (it holds sign-in tokens). Required with Redis. */
  get stateSecret(): string | undefined {
    return text('STATE_SECRET')
  },
}
