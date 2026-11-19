import type { ReactNode } from 'react'

/*
  Full-bleed sign-in scene: a deep brand field with a faint chevron pattern,
  one floating card, wordmark above and small print below. A pale page with
  stacked blocks reads like a form; this reads like a product.

  The pattern is pure CSS so there is no asset to load or get wrong.
*/
const chevrons = {
  backgroundImage: [
    'repeating-linear-gradient(135deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 78px)',
    'repeating-linear-gradient(45deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 78px)',
    'radial-gradient(120% 80% at 50% -10%, rgba(239,95,27,0.22) 0%, transparent 60%)',
  ].join(','),
}

export function AuthScene({
  children,
  aside,
  footnote,
}: {
  children: ReactNode
  /** Reassurance shown under the card, on the dark field. */
  aside?: ReactNode
  footnote?: ReactNode
}) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-surface-ink text-white" style={chevrons}>
      <header className="flex items-center justify-between gap-3 px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-xl bg-brand text-base font-extrabold text-on-brand"
          >
            a
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">Amana</span>
        </div>
        <span className="text-sm font-semibold text-white/60">Agree · Verify · Pay</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-6 sm:py-10">
        <div className="grid w-full max-w-[27rem] gap-6">
          <div className="rounded-3xl bg-surface p-6 text-ink shadow-[0_30px_70px_-25px_rgba(0,0,0,0.65)] sm:p-7">
            {children}
          </div>
          {aside}
        </div>
      </main>

      {footnote && (
        <footer className="px-5 pb-7 text-center text-xs text-white/45 sm:px-8">{footnote}</footer>
      )}
    </div>
  )
}

/** One reassurance line on the dark field. */
export function AuthAssurance({ items }: { items: [string, string][] }) {
  return (
    <ul className="m-0 grid list-none gap-2.5 p-0">
      {items.map(([title, body]) => (
        <li key={title} className="flex gap-2.5">
          <span
            aria-hidden="true"
            className="mt-[3px] grid size-4 shrink-0 place-items-center rounded-full bg-white/15 text-[0.6rem] font-black text-white"
          >
            ✓
          </span>
          <span className="text-[0.82rem] leading-snug text-white/70">
            <strong className="font-bold text-white">{title}.</strong> {body}
          </span>
        </li>
      ))}
    </ul>
  )
}
