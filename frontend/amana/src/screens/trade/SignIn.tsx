import { Banner, Button, Card, OtpInput, PageTitle, PhoneInput } from '../../ui'
import { } from './shared'

export interface SignInProps {
  step: 'phone' | 'otp'
  phone: string
  code: string
  phoneError?: string
  codeError?: string
  loading?: boolean
  /** Seconds until a new code can be requested. 0 means resend is available. */
  resendIn: number
  rateLimited?: boolean
  onPhoneChange: (value: string) => void
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
          subtitle="Enter your phone number. We will text you a one-time code. No password needed."
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
      <PageTitle title="Enter your code" subtitle={`We sent a 6-digit code to ${p.phone}.`} />
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
