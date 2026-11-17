import { useEffect, useState } from 'react'
import { Banner, Button, Card, OtpInput, PageTitle, PhoneInput } from '../../ui'
import { isValidNigerianPhone } from './shared'

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

const DEMO_CODE = '123456'

export function SignInPreview() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [phoneError, setPhoneError] = useState<string>()
  const [codeError, setCodeError] = useState<string>()
  const [resendIn, setResendIn] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  if (signedIn) {
    return (
      <div className="grid gap-4">
        <Banner tone="success" title="You are signed in">
          In the real app you would now continue to your order.
        </Banner>
        <Button
          onClick={() => {
            setSignedIn(false)
            setStep('phone')
            setCode('')
            setAttempts(0)
          }}
        >
          Restart demo
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <SignIn
        step={step}
        phone={phone}
        code={code}
        phoneError={phoneError}
        codeError={codeError}
        resendIn={resendIn}
        rateLimited={attempts >= 3}
        onPhoneChange={(v) => {
          setPhone(v)
          setPhoneError(undefined)
        }}
        onCodeChange={(v) => {
          setCode(v)
          setCodeError(undefined)
        }}
        onSendCode={() => {
          if (!isValidNigerianPhone(phone)) {
            setPhoneError('Enter a valid Nigerian phone number, for example 0801 234 5678.')
            return
          }
          setStep('otp')
          setResendIn(30)
        }}
        onVerify={() => {
          if (code === DEMO_CODE) {
            setSignedIn(true)
            return
          }
          setAttempts((n) => n + 1)
          setCodeError('That code is not correct or has expired. Check the code and try again.')
        }}
        onResend={() => {
          setResendIn(30)
          setCode('')
          setCodeError(undefined)
        }}
        onChangeNumber={() => {
          setStep('phone')
          setCode('')
          setCodeError(undefined)
        }}
      />
      <p className="text-xs text-muted">
        Demo only: the correct code is {DEMO_CODE}. Three wrong codes show the rate-limit state.
      </p>
    </div>
  )
}
