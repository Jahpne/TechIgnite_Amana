import { config } from './config.js'
import { log } from './log.js'

// A thin client for any OpenAI-compatible chat service that supports tool calling (Groq by default).

export interface ToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

export const aiEnabled = config.aiKey !== undefined

// Reasoning models (gpt-oss, o-series, gpt-5) think before they answer. That thinking counts
// against the limit, so leave room, and ask for little of it: this is a quick chat reply.
const REASONING_MODEL = /gpt-oss|(^|\/)o\d|gpt-5/i

function headers(): Record<string, string> {
  return { authorization: `Bearer ${config.aiKey}`, 'content-type': 'application/json' }
}

/**
 * One round with the model. Returns null when the AI is off or the call fails, so the caller can
 * say so plainly instead of the bot going quiet.
 */
export async function complete(messages: ChatMessage[], tools: unknown[]): Promise<ChatMessage | null> {
  if (!config.aiKey) return null

  try {
    const send = () =>
      fetch(`${config.aiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          model: config.aiModel,
          messages,
          tools,
          tool_choice: 'auto',
          max_completion_tokens: 1500,
          // "medium": at "low" the model often answered in words instead of calling a tool.
          ...(REASONING_MODEL.test(config.aiModel) ? { reasoning_effort: 'medium' } : { temperature: 0.2 }),
        }),
        signal: AbortSignal.timeout(45_000),
      })

    let response = await send()
    if (response.status === 429) {
      // Free plans have tight per-minute limits. Wait as long as the service asks (up to 10 s) and try once more.
      const waitSeconds = Math.min(Number(response.headers.get('retry-after')) || 4, 10)
      log.warn({ waitSeconds }, 'AI rate limit reached; waiting once before retrying')
      await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000))
      response = await send()
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) log.error('The AI API key was rejected')
      else if (response.status === 429) log.warn('AI rate limit reached')
      else if (response.status === 400 || response.status === 404) log.error({ status: response.status, model: config.aiModel }, 'The AI service refused the request. Is AI_MODEL a model that supports tools?')
      else log.error({ status: response.status }, 'AI request failed')
      return null
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: unknown; tool_calls?: unknown } }[]
    }
    const message = data.choices?.[0]?.message
    if (!message) return null

    const toolCalls = Array.isArray(message.tool_calls)
      ? (message.tool_calls as ToolCall[]).filter(
          (c) => typeof c?.id === 'string' && typeof c?.function?.name === 'string',
        )
      : []
    return {
      role: 'assistant',
      content: typeof message.content === 'string' ? message.content : null,
      ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
    }
  } catch (error) {
    log.error({ err: error instanceof Error ? error.message : String(error) }, 'AI request failed')
    return null
  }
}

/**
 * Run once at start-up. Checks the chosen model against the models this key can use, and says
 * so plainly if it is not one of them. It never stops the bot.
 */
export async function checkModel(): Promise<void> {
  if (!config.aiKey) return
  try {
    const response = await fetch(`${config.aiBaseUrl}/models`, { headers: headers(), signal: AbortSignal.timeout(15_000) })
    if (!response.ok) {
      log.warn({ status: response.status }, 'Could not read the AI model list. Check AI_API_KEY and AI_BASE_URL.')
      return
    }
    const data = (await response.json()) as { data?: { id?: unknown }[] }
    const ids = (data.data ?? []).map((m) => m.id).filter((id): id is string => typeof id === 'string')
    if (ids.includes(config.aiModel)) {
      log.info({ model: config.aiModel }, 'AI model is available')
    } else {
      log.warn({ model: config.aiModel, available: ids.slice(0, 25) }, 'AI_MODEL is not in your model list. Set AI_MODEL to one of these.')
    }
  } catch (error) {
    log.warn({ err: error instanceof Error ? error.message : String(error) }, 'Could not check the AI model list')
  }
}
