import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { requestOTP, verifyOTP } from '../api/auth'
import { safeNext } from '../auth/next'
import { setSession } from '../auth/session'
import { errorMessage } from '../hooks/errors'

// The accounts the backend seeds (prisma/seed.ts in amana-backend).
const ACCOUNTS = [
  { label: 'Seller', name: 'Tunde', phone: '+2348010000001' },
  { label: 'Buyer', name: 'Ada', phone: '+2348010000002' },
  { label: 'Client', name: 'Grace', phone: '+2348010000003' },
  { label: 'Freelancer', name: 'David', phone: '+2348010000004' },
  { label: 'Admin', name: 'Amana admin', phone: '+2348010000009' },
] as const

// Shown only when VITE_AUTOFILL_OTP=true, because it relies on the backend returning a debug
// code with the sign-in request. That only happens on the sandbox.
const quickSignInEnabled = import.meta.env.VITE_AUTOFILL_OTP === 'true'

// compact: used inside another page (the sign-in page), so no outer spacing.
// next: where to go after signing in. Admins go to the disputes page when nothing is given.
export function QuickSignIn({ compact, next }: { compact?: boolean; next?: string }) {
  const router = useRouter()
  const qc = useQueryClient()
  const [busy, setBusy] = useState<string>()
  const [error, setError] = useState<string>()

  if (!quickSignInEnabled) return null

  const signInAs = async (phone: string, isAdmin: boolean) => {
    setBusy(phone)
    setError(undefined)
    try {
      const sent = await requestOTP(phone)
      if (!sent.debugCode) {
        setError('The backend did not return a code. Use the phone sign-in instead.')
        return
      }
      const result = await verifyOTP(phone, sent.debugCode)
      qc.clear()
      setSession(result.token)
      qc.setQueryData(['me'], result.user)
      router.history.push(safeNext(next, isAdmin ? '/admin/disputes' : '/agreements'))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(undefined)
    }
  }

  // Compact: a quiet demo shortcut inside the sign-in scene, collapsed by
  // default so it never competes with the real form.
  if (compact) {
    return (
      <details className="group mx-auto w-full max-w-[27rem] text-left">
        <summary className="cursor-pointer list-none text-center text-xs font-semibold text-white/50 underline-offset-4 hover:text-white/80 hover:underline">
          Demo accounts for judges
        </summary>
        <div className="mt-3 grid gap-2.5 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 ring-inset">
          <p className="text-[0.78rem] leading-snug text-white/55">
            Signs in instantly as a seeded persona, skipping the emailed code. Sandbox only.
          </p>
          <div className="flex flex-wrap gap-2">
            {ACCOUNTS.map((a) => (
              <button
                key={a.phone}
                type="button"
                disabled={busy !== undefined}
                onClick={() => void signInAs(a.phone, a.label === 'Admin')}
                className="min-h-9 cursor-pointer rounded-full bg-white/10 px-3.5 text-xs font-bold text-white/90 transition-colors hover:bg-white/20 disabled:opacity-50"
              >
                {busy === a.phone ? 'Signing in…' : `${a.label} · ${a.name}`}
              </button>
            ))}
          </div>
          {error && (
            <p role="alert" className="text-xs font-semibold text-white">
              {error}
            </p>
          )}
        </div>
      </details>
    )
  }

  return (
    <section id="signin" className="mx-auto w-full max-w-5xl px-4 pt-10">
      <div className="grid gap-4 rounded-3xl border border-line bg-surface p-6 shadow-card">
        <div className="grid gap-1">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Sign in</h2>
          <p className="text-muted">Pick an account to continue. Each one is a different person in a deal.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACCOUNTS.map((a) => (
            <button
              key={a.phone}
              type="button"
              disabled={busy !== undefined}
              onClick={() => void signInAs(a.phone, a.label === 'Admin')}
              className="min-h-11 cursor-pointer rounded-full border border-line bg-surface-2 px-5 text-sm font-bold transition-colors hover:border-brand-ring disabled:opacity-50"
            >
              {busy === a.phone ? 'Signing in…' : `${a.label} (${a.name})`}
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="text-sm font-semibold text-danger">
            {error}
          </p>
        )}
      </div>
    </section>
  )
}
