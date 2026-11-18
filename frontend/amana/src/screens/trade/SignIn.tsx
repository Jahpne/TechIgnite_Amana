import { Banner, Button, Card, OtpInput, PageTitle, PhoneInput, TextField } from '../../ui'

export interface SignInProps {
  step: 'phone' | 'otp'
  phone: string
  email: string
  code: string
  phoneError?: string
  emailError?: string
  /** Where the code actually went, masked by the backend. */
  sentTo?: string
  codeError?: string
  loading?: boolean
  /** Seconds until a new code can be requested. 0 means resend is available. */
  resendIn: number
  rateLimited?: boolean
  onPhoneChange: (value: string) => void
  onEmailChange: (value: string) => void
  onCodeChange: (value: string) => void
  onSendCode: () => void
  onVerify: () => void
  onResend: () => void
  onChangeNumber: () => void
}

export function SignIn(p: SignInProps) {
  if (p.step === 'phone') {
    return (
      <div className="grid gap-6">
        <div className="grid gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-success-soft px-3 py-1 text-xs font-bold tracking-wide text-success uppercase ring-1 ring-success/20 ring-inset">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
            Money held until delivery
          </span>
          <h1 className="font-display text-[2.1rem] leading-[1.08] font-extrabold tracking-tight">
            Deals where nobody
            <br />
            has to go first.
          </h1>
          <p className="text-[0.95rem] leading-relaxed text-muted">
            Sign in with your phone number. We email you a one-time code — no password to forget.
          </p>
        </div>

        <Card className="shadow-lift">
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              p.onSendCode()
            }}
          >
            <PhoneInput value={p.phone} onChange={p.onPhoneChange} error={p.phoneError} />
            <TextField
              label="Email address"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={p.email}
              onChange={p.onEmailChange}
              error={p.emailError}
              hint="We send your sign-in code here."
            />
            <Button variant="primary" block type="submit" loading={p.loading}>
              Send code
            </Button>
          </form>
          <p className="text-xs leading-relaxed text-muted">
            New here? We create a basic Amana account for this number.
          </p>
        </Card>

        <ul className="m-0 grid list-none gap-2.5 p-0">
          {[
            ['Paga holds the money', 'Funds sit in an account opened for your deal, not ours.'],
            ['Released only when verified', 'Delivery confirmed, or milestone approved. Never before.'],
            ['Either side can pause it', 'Raise a problem and the payout freezes until it is settled.'],
          ].map(([title, body]) => (
            <li key={title} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-[0.65rem] font-black text-brand"
              >
                ✓
              </span>
              <span className="text-sm leading-snug">
                <strong className="font-bold">{title}.</strong>{' '}
                <span className="text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="grid gap-5">
      <PageTitle
        title="Enter your code"
        subtitle={`We sent a 6-digit code to ${p.sentTo ?? p.phone}. It expires in 10 minutes.`}
      />
      <Card className="shadow-lift">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            p.onVerify()
          }}
        >
          {p.rateLimited && (
            <Banner tone="danger" title="Too many attempts">
              Wait a few minutes before you try again.
            </Banner>
          )}
          <OtpInput value={p.code} onChange={p.onCodeChange} error={p.codeError} />
          <Button
            variant="primary"
            block
            type="submit"
            loading={p.loading}
            disabled={p.rateLimited || p.code.length < 6}
          >
            Verify and continue
          </Button>
        </form>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <Button variant="ghost" onClick={p.onChangeNumber}>
            Use a different number
          </Button>
          <Button variant="ghost" onClick={p.onResend} disabled={p.resendIn > 0 || p.rateLimited}>
            {p.resendIn > 0 ? `Resend code in ${p.resendIn}s` : 'Resend code'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
