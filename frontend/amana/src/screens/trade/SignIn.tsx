import { Banner, Button, Card, OtpInput, PageTitle, PhoneInput, TextField } from '../../ui'

export interface SignInProps {
  step: 'phone' | 'otp'
  phone: string
  email: string
  code: string
  phoneError?: string
  emailError?: string
  /** Where the code was sent, for the line above the code box. */
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
      <div className="grid gap-4">
        <PageTitle
          title="Sign in"
          subtitle="Enter your phone number and email address. We email you a one-time code. No password needed."
        />
        <Card>
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
        </Card>
        <p className="text-xs text-muted">If you are new, we will create a basic Amana account for this number.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <PageTitle title="Enter your code" subtitle={`We sent a 6-digit code to ${p.sentTo ?? p.phone}.`} />
      <Card>
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
