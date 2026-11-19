import { waitUntil } from '@vercel/functions'
import { handleWebhook } from './webhook.js'

// Vercel function entry: the WhatsApp Cloud API webhook. `pnpm build:cloud` bundles this file into
// api/whatsapp.js, which is the file Vercel runs.
export default {
  fetch(request: Request): Promise<Response> {
    return handleWebhook(request, waitUntil)
  },
}
