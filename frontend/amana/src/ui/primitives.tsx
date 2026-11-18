import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { Tone } from './types'

// Full literal class strings so Tailwind can detect every class.
const toneBadge: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted ring-line',
  info: 'bg-info-soft text-info ring-info/20',
  success: 'bg-success-soft text-success ring-success/20',
  warning: 'bg-warning-soft text-warning ring-warning/20',
  danger: 'bg-danger-soft text-danger ring-danger/20',
  ai: 'bg-ai-soft text-ai ring-ai/20',
}

const toneDot: Record<Tone, string> = {
  neutral: 'bg-muted',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  ai: 'bg-ai',
}

const toneBanner: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-ink border-line-strong',
  info: 'bg-info-soft text-info border-info',
  success: 'bg-success-soft text-success border-success',
  warning: 'bg-warning-soft text-warning border-warning',
  danger: 'bg-danger-soft text-danger border-danger',
  ai: 'bg-ai-soft text-ai border-ai',
}

// Router-free page frame. Pass nav or user controls through `header`.
export function AppShell({
  children,
  header,
  wide,
}: {
  children: ReactNode
  header?: ReactNode
  wide?: boolean
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-page text-ink">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-page/85 backdrop-blur-md">
        <div
          className={`mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 ${
            wide ? 'max-w-5xl' : 'max-w-xl'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-xl bg-brand text-base font-extrabold text-on-brand shadow-brand"
            >
              a
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-extrabold tracking-tight">Amana</span>
              <small className="block text-[0.68rem] font-semibold tracking-[0.14em] text-muted uppercase">
                Agree · Verify · Pay
              </small>
            </span>
          </div>
          {header}
        </div>
      </header>
      <main
        className={`mx-auto grid w-full content-start gap-5 px-4 pt-6 pb-16 ${wide ? 'max-w-5xl' : 'max-w-xl'}`}
      >
        {children}
      </main>
    </div>
  )
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="grid gap-1.5">
      <h1 className="font-display text-[1.75rem] leading-[1.15] font-extrabold">{title}</h1>
      {subtitle && <p className="text-[0.95rem] leading-relaxed text-muted">{subtitle}</p>}
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
    <section
      className={`grid gap-3.5 rounded-2xl border border-line bg-surface p-5 shadow-card ${className}`}
    >
      {title && <h2 className="font-display text-[1.0625rem] leading-snug font-bold">{title}</h2>}
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
  default: 'border-line-strong bg-surface text-ink shadow-card hover:bg-surface-2 hover:border-brand-ring',
  primary:
    'border-transparent bg-brand text-on-brand shadow-brand hover:bg-brand-strong',
  danger: 'border-danger/30 bg-danger-soft text-danger hover:bg-danger hover:text-on-brand',
  ghost: 'border-transparent bg-transparent text-muted hover:bg-surface-2 hover:text-ink',
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
      className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 font-bold transition-all duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${buttonVariant[variant]} ${block ? 'w-full' : ''} ${className}`}
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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold tracking-wide whitespace-nowrap uppercase ring-1 ring-inset ${toneBadge[tone]}`}
    >
      {icon ? (
        <span aria-hidden="true">{icon}</span>
      ) : (
        <span aria-hidden="true" className={`size-1.5 rounded-full ${toneDot[tone]}`} />
      )}
      {children}
    </span>
  )
}

export function Banner({ tone, title, children }: { tone: Tone; title?: string; children?: ReactNode }) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-xl border-l-4 px-4 py-3.5 text-sm leading-relaxed ${toneBanner[tone]}`}
    >
      <div>
        {title && <strong className="mb-0.5 block font-bold">{title}</strong>}
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
            className={`min-h-10 cursor-pointer rounded-full border px-4 text-sm font-bold whitespace-nowrap transition-colors ${
              active
                ? 'border-transparent bg-ink text-on-brand'
                : 'border-line bg-surface text-muted hover:border-brand-ring hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
