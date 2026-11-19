import { Banner, Button, OtpInput, PhoneInput, TextField } from '../../ui'

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
      <div className="grid gap-5">
        <div className="grid gap-2">
          <h1 className="font-display text-[1.6rem] leading-[1.1] font-extrabold tracking-tight">
            Sign in
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            We email you a one-time code. No password to forget.
          </p>
        </div>

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
      </div>
    )
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-1.5">
        <h1 className="font-display text-[1.6rem] leading-[1.1] font-extrabold tracking-tight">
          Enter your code
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          We sent a 6-digit code to <strong className="font-bold text-ink">{p.sentTo ?? p.phone}</strong>. It
          expires in 10 minutes.
        </p>
      </div>
      <div className="grid gap-4">
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
      </div>
    </div>
  )
}
