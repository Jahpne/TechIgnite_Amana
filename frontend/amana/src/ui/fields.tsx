import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import './ui.css'

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
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': descId })}
      {error ? (
        <span id={descId} className="error" role="alert">
          {error}
        </span>
      ) : (
        hint && (
          <span id={descId} className="hint">
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
      {(a11y) => <input className="input" {...a11y} {...rest} value={value} onChange={(e) => onChange(e.target.value)} />}
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

// Amounts are whole naira. The value is a digit string, never a float.
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
        <div className="input-prefix">
          <span aria-hidden="true">₦</span>
          <input
            className="input"
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
        <textarea className="textarea" {...a11y} {...rest} value={value} onChange={(e) => onChange(e.target.value)} />
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
  const id = useId()
  const errId = `${id}-err`
  return (
    <div className="field">
      <label htmlFor={id}>One-time code</label>
      <input
        id={id}
        className="input"
        style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 }}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errId : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
      />
      {error && (
        <span id={errId} className="error" role="alert">
          {error}
        </span>
      )}
    </div>
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
  accept,
}: {
  label: string
  limits: string
  files: PickedFile[]
  onPick: (files: FileList) => void
  onRemove?: (name: string) => void
  error?: string
  accept?: string
}) {
  const id = useId()
  return (
    <div className="field">
      <span className="label">{label}</span>
      <div className="dropzone">
        <label htmlFor={id} className="btn">
          Choose files
        </label>
        <input
          id={id}
          type="file"
          multiple
          accept={accept}
          className="visually-hidden"
          onChange={(e) => e.target.files && onPick(e.target.files)}
        />
        <span className="hint">{limits}</span>
      </div>
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f) => (
            <li key={f.name}>
              <span>
                {f.name} <span className="muted">({f.sizeLabel})</span>
              </span>
              {onRemove && (
                <button type="button" className="btn ghost" onClick={() => onRemove(f.name)} aria-label={`Remove ${f.name}`}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <span className="error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
