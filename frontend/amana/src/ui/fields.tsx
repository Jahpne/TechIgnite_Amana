import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

const inputBase =
  'min-h-12 w-full rounded-xl border bg-surface px-3.5 py-3 text-ink transition-colors placeholder:text-muted/70 hover:border-line-strong focus:border-brand aria-[invalid=true]:border-danger'
const inputBorder = 'border-line-strong'

interface FieldProps {
  label: string
  hint?: string
  error?: string
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
}

export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId()
  const descId = error || hint ? `${id}-desc` : undefined
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': descId })}
      {error ? (
        <span id={descId} role="alert" className="text-sm font-semibold text-danger">
          {error}
        </span>
      ) : (
        hint && (
          <span id={descId} className="text-xs text-muted">
            {hint}
          </span>
        )
      )}
    </div>
  )
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label: string
  hint?: string
  error?: string
  value: string
  onChange: (value: string) => void
}

export function TextField({ label, hint, error, value, onChange, ...rest }: InputProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(a11y) => (
        <input
          className={`${inputBase} ${inputBorder}`}
          {...a11y}
          {...rest}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  )
}

export function PhoneInput({
  label = 'Phone number',
  hint = 'Nigerian number, for example 0801 234 5678',
  ...p
}: Omit<InputProps, 'label'> & { label?: string }) {
  return (
    <TextField
      label={label}
      hint={hint}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="0801 234 5678"
      {...p}
    />
  )
}

// Whole naira only. The value is a digit string, never a float.
export function AmountInput({
  label,
  hint,
  error,
  value,
  onChange,
  ...rest
}: Omit<InputProps, 'type' | 'inputMode'>) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(a11y) => (
        <div className="flex items-stretch">
          <span
            aria-hidden="true"
            className="grid place-items-center rounded-l-xl border border-r-0 border-line-strong bg-surface-2 px-3.5 font-bold text-muted"
          >
            ₦
          </span>
          <input
            className={`${inputBase} ${inputBorder} rounded-l-none font-display text-lg font-bold tabular-nums`}
            {...a11y}
            {...rest}
            inputMode="numeric"
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          />
        </div>
      )}
    </Field>
  )
}

type AreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & {
  label: string
  hint?: string
  error?: string
  value: string
  onChange: (value: string) => void
}

export function TextArea({ label, hint, error, value, onChange, ...rest }: AreaProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(a11y) => (
        <textarea
          className={`${inputBase} ${inputBorder} min-h-28 resize-y`}
          {...a11y}
          {...rest}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  )
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  error,
}: {
  value: string
  onChange: (value: string) => void
  length?: number
  error?: string
}) {
  return (
    <Field label="One-time code" hint={`Enter the ${length}-digit code we sent you`} error={error}>
      {(a11y) => (
        <input
          className={`${inputBase} ${inputBorder} py-4 text-center font-display text-2xl font-extrabold tracking-[0.45em]`}
          {...a11y}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        />
      )}
    </Field>
  )
}

export interface PickedFile {
  name: string
  sizeLabel: string
}

export function FileUpload({
  label,
  limits,
  files,
  onPick,
  onRemove,
  error,
}: {
  label: string
  limits: string
  files: PickedFile[]
  onPick: (files: FileList) => void
  onRemove?: (name: string) => void
  error?: string
}) {
  const id = useId()
  return (
    <div className="grid gap-1">
      <span className="text-sm font-semibold">{label}</span>
      <div className="grid justify-items-center gap-2 rounded-lg border-2 border-dashed border-line bg-surface-2 p-4 text-center">
        <label
          htmlFor={id}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-line bg-surface px-4 font-semibold hover:bg-surface-2 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand"
        >
          Choose files
          <input
            id={id}
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => e.target.files && onPick(e.target.files)}
          />
        </label>
        <span className="text-xs text-muted">{limits}</span>
      </div>
      {files.length > 0 && (
        <ul className="m-0 grid list-none gap-2 p-0">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-sm"
            >
              <span className="break-all">
                {f.name} <span className="text-muted">({f.sizeLabel})</span>
              </span>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(f.name)}
                  aria-label={`Remove ${f.name}`}
                  className="min-h-11 cursor-pointer rounded-lg px-3 font-semibold hover:bg-surface-2"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <span role="alert" className="text-sm font-semibold text-danger">
          {error}
        </span>
      )}
    </div>
  )
}
