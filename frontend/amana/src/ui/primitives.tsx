import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { Tone } from './types'

// Full literal class strings so Tailwind can detect every class.
const toneBadge: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted',
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  ai: 'bg-ai-soft text-ai',
}

const toneBanner: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-ink border-line',
  info: 'bg-info-soft text-info border-info',
  success: 'bg-success-soft text-success border-success',
  warning: 'bg-warning-soft text-warning border-warning',
  danger: 'bg-danger-soft text-danger border-danger',
  ai: 'bg-ai-soft text-ai border-ai',
}

export function SandboxBanner() {
  return (
    <div role="note" className="bg-warning-soft px-4 py-1.5 text-center text-xs font-semibold text-warning">
      Demo runs on the Paga sandbox. No real money moves.
    </div>
  )
}

// Router-free page frame. Pass nav or user controls through `header`.
export function AppShell({
  children,
  header,
  wide,
  hideSandboxBanner,
}: {
  children: ReactNode
  header?: ReactNode
  wide?: boolean
  hideSandboxBanner?: boolean
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-page text-ink">
      {!hideSandboxBanner && <SandboxBanner />}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
        <div className="text-xl leading-tight font-extrabold tracking-tight text-brand">
          Amana
          <small className="block text-[0.7rem] font-medium tracking-wider text-muted">Agree. Verify. Pay.</small>
        </div>
        {header}
      </header>
      <main
        className={`mx-auto grid w-full content-start gap-4 p-4 ${wide ? 'max-w-5xl' : 'max-w-xl'}`}
      >
        {children}
      </main>
    </div>
  )
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="grid gap-1">
      <h1 className="text-2xl leading-tight font-bold">{title}</h1>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
    </div>
  )
}

export function Card({
  title,
  children,
  className = '',
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`grid gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm ${className}`}>
      {title && <h2 className="text-lg leading-snug font-semibold">{title}</h2>}
      {children}
    </section>
  )
}

export function KeyValues({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-[0.95rem]">
      {items.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="m-0 text-right break-words">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

const buttonVariant = {
  default: 'border-line bg-surface text-ink hover:bg-surface-2',
  primary: 'border-brand bg-brand text-on-brand hover:bg-brand-strong hover:border-brand-strong',
  danger: 'border-danger bg-danger-soft text-danger hover:brightness-95',
  ghost: 'border-transparent bg-transparent text-ink hover:bg-surface-2',
} as const

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariant
  block?: boolean
  loading?: boolean
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-[1em] animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  )
}

export function Button({
  variant = 'default',
  block,
  loading,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${buttonVariant[variant]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export function Badge({ tone, icon, children }: { tone: Tone; icon?: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${toneBadge[tone]}`}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}

export function Banner({ tone, title, children }: { tone: Tone; title?: string; children?: ReactNode }) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-lg border-l-4 px-4 py-3 text-sm ${toneBanner[tone]}`}
    >
      <div>
        {title && <strong className="block">{title}</strong>}
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

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-2 overflow-x-auto pb-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`min-h-11 cursor-pointer rounded-full border px-4 text-sm font-semibold whitespace-nowrap ${
              active ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface text-ink hover:bg-surface-2'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
