import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { Tone } from './types'
import './ui.css'

export function SandboxBanner() {
  return (
    <div className="sandbox" role="note">
      Demo runs on the Paga sandbox. No real money moves.
    </div>
  )
}

export function AppShell({ children, wide, right }: { children: ReactNode; wide?: boolean; right?: ReactNode }) {
  return (
    <div className="app-shell">
      <SandboxBanner />
      <header className="app-header">
        <div className="brand">
          Amana
          <small>Agree. Verify. Pay.</small>
        </div>
        {right}
      </header>
      <main className={`app-main${wide ? ' wide' : ''}`}>{children}</main>
    </div>
  )
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="page-title">
      <h1>{title}</h1>
      {subtitle && <p className="muted">{subtitle}</p>}
    </div>
  )
}

export function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`.trim()}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  )
}

// Label and value pairs. Also used for receipts.
export function KeyValues({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="kv">
      {items.map(([k, v]) => (
        <div key={k} style={{ display: 'contents' }}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'default'
  block?: boolean
  loading?: boolean
}

export function Button({ variant = 'default', block, loading, disabled, children, className = '', ...rest }: ButtonProps) {
  const cls = ['btn', variant !== 'default' ? variant : '', block ? 'block' : '', className].filter(Boolean).join(' ')
  return (
    <button type="button" className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function Badge({ tone, icon, children }: { tone: Tone; icon?: string; children: ReactNode }) {
  return (
    <span className={`badge tone-${tone}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}

export function Banner({ tone, title, children }: { tone: Tone; title?: string; children?: ReactNode }) {
  return (
    <div className={`banner tone-${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <div>
        {title && <strong>{title}</strong>}
        {children}
      </div>
    </div>
  )
}

export function DisputeBanner() {
  return (
    <Banner tone="danger" title="Payout is paused">
      A dispute is open on this agreement. Nothing will be paid until an admin reviews the evidence from both sides.
    </Banner>
  )
}

export function AiSuggestionLabel() {
  return (
    <Badge tone="ai" icon="✦">
      Suggested by AI, please review
    </Badge>
  )
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <span className="spinner" role="status" aria-label={label} />
}

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p className="muted">{message}</p>
    </div>
  )
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="state">
      <h2>{title}</h2>
      {message && <p className="muted">{message}</p>}
      {actionLabel && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="state" role="alert">
      <h2>{title}</h2>
      {message && <p className="muted">{message}</p>}
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
    </div>
  )
}

// Status filters for lists (S10). Single select.
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label = 'Filter',
}: {
  options: { value: T; label: string; count?: number }[]
  value: T
  onChange: (value: T) => void
  label?: string
}) {
  return (
    <div className="filters" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="chip"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
          {o.count !== undefined ? ` (${o.count})` : ''}
        </button>
      ))}
    </div>
  )
}
