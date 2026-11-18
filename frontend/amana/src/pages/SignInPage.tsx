import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { requestOTP, verifyOTP } from '../api/auth'
import { safeNext } from '../auth/next'
import { toE164 } from '../auth/phone'
import { setSession } from '../auth/session'
import { errorMessage } from '../hooks/errors'
import { SignIn } from '../screens/trade/SignIn'
import { isValidNigerianPhone } from '../screens/trade/shared'

const AUTOFILL_OTP = import.meta.env.VITE_AUTOFILL_OTP === 'true'
const RESEND_SECONDS = 30
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_WRONG_CODES = 3

export function SignInPage({ next }: { next?: string }) {
  const router = useRouter()
  const qc = useQueryClient()

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string>()
  const [sentTo, setSentTo] = useState<string>()
  const [code, setCode] = useState('')
  const [phoneError, setPhoneError] = useState<string>()
  const [codeError, setCodeError] = useState<string>()
  const [resendIn, setResendIn] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const sendCode = async () => {
    if (!isValidNigerianPhone(phone)) {
      setPhoneError('Enter a valid Nigerian phone number, for example 0801 234 5678.')
      return
    }
    const address = email.trim()
    if (address && !EMAIL_PATTERN.test(address)) {
      setEmailError('Enter a valid email address, for example you@example.com.')
      return
    }
    setLoading(true)
    try {
      const sent = await requestOTP(toE164(phone), address || undefined)
      // Presenter convenience: while the backend returns debugCode (sandbox) and this flag is on,
      // fill the code in. Never needed in a real build, where codes arrive by email.
      const autofill = AUTOFILL_OTP && sent.debugCode ? sent.debugCode : undefined
      if (!sent.sent && !autofill) {
        // Nothing was delivered, so do not send the person to a code box they can never fill.
        setEmailError(
          address
            ? 'We could not email a code to that address. Check it and try again.'
            : 'Enter your email address so we can send your code.',
        )
        return
      }
      setStep('otp')
      setSentTo(sent.sent ? address || 'the email address on your account' : phone)
      setCode(autofill ?? '')
      setResendIn(RESEND_SECONDS)
    } catch (err) {
      setPhoneError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const verify = async () => {
    if (code.length !== 6) {
      setCodeError('Enter the 6-digit code.')
      return
    }
    setLoading(true)
    try {
      const result = await verifyOTP(toE164(phone), code)
      setSession(result.token)
      qc.setQueryData(['me'], result.user)
      router.history.push(safeNext(next))
    } catch (err) {
      setWrong((n) => n + 1)
      setCodeError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SignIn
      step={step}
      phone={phone}
      email={email}
      code={code}
      phoneError={phoneError}
      emailError={emailError}
      sentTo={sentTo}
      codeError={codeError}
      loading={loading}
      resendIn={resendIn}
      rateLimited={wrong >= MAX_WRONG_CODES}
      onPhoneChange={(v) => {
        setPhone(v)
        setPhoneError(undefined)
      }}
      onEmailChange={(v) => {
        setEmail(v)
        setEmailError(undefined)
      }}
      onCodeChange={(v) => {
        setCode(v)
        setCodeError(undefined)
      }}
      onSendCode={() => void sendCode()}
      onVerify={() => void verify()}
      onResend={() => void sendCode()}
      onChangeNumber={() => {
        setStep('phone')
        setCode('')
        setCodeError(undefined)
      }}
    />
  )
}
