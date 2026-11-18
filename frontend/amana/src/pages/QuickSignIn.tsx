import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { requestOTP, verifyOTP } from '../api/auth'
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

export function QuickSignIn() {
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
      router.history.push(isAdmin ? '/admin/disputes' : '/agreements')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(undefined)
    }
  }

  return (
    <section id="signin" className="mx-auto w-full max-w-5xl px-4 pt-10">
      <div className="grid gap-4 rounded-3xl border border-line bg-surface p-6 shadow-sm">
        <div className="grid gap-1">
          <h2 className="text-2xl font-extrabold tracking-tight">Sign in</h2>
          <p className="text-muted">Pick an account to continue. Each one is a different person in a deal.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACCOUNTS.map((a) => (
            <button
              key={a.phone}
              type="button"
              disabled={busy !== undefined}
              onClick={() => void signInAs(a.phone, a.label === 'Admin')}
              className="min-h-11 rounded-full border border-line bg-surface-2 px-5 text-sm font-semibold hover:bg-brand-soft disabled:opacity-60"
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
        <p className="text-sm text-muted">
          Prefer your own number? <a href="/signin">Sign in with a phone number</a>.
        </p>
      </div>
    </section>
  )
}
