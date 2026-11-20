import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

// Load settings from a "bot.env" file that lives OUTSIDE the deploy folder.
// Some hosts replace the program's folder on every deploy, so a .env inside it would be lost.
// Looked for, in order: BOT_ENV_FILE, the user's home folder, then this folder and up to three parents.
// Values that are already set in the environment are never overwritten.
// This must be the first import, so the settings are in place before the rest of the bot reads them.

const candidates = [
  process.env.BOT_ENV_FILE,
  join(homedir(), 'bot.env'),
  ...[0, 1, 2, 3].map((up) => resolve(process.cwd(), ...Array<string>(up).fill('..'), 'bot.env')),
].filter((path): path is string => Boolean(path))

export let loadedEnvFile: string | undefined

for (const path of candidates) {
  if (!existsSync(path)) continue
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(path)
      loadedEnvFile = path
    }
  } catch {
    // An unreadable file is skipped. The bot then runs with what it has.
  }
  break
}
