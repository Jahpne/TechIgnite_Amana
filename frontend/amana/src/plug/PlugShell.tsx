import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

/** Shared chrome for the Plug surface: browse, sell, and back into Amana. */
export function PlugShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-page text-ink">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-page/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/plug" className="flex items-center gap-2.5 no-underline">
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-xl bg-brand text-base font-extrabold text-on-brand"
            >
              a
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-extrabold tracking-tight text-ink">
                Amana <span className="text-brand">Plug</span>
              </span>
              <small className="block text-[0.68rem] font-semibold tracking-[0.1em] text-muted uppercase">
                Buy without going first
              </small>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/plug/sell"
              className="inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-bold no-underline transition-colors hover:border-brand-ring"
            >
              Sell something
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-5xl content-start gap-6 px-4 pt-6 pb-16">{children}</main>
      <footer className="border-t border-line px-4 py-6 text-center text-xs text-muted">
        Every deal on Plug is held by Amana until the buyer confirms it arrived.
      </footer>
    </div>
  )
}

/** The promise, repeated wherever money is about to be discussed. */
export function ProtectedNote({ className = '' }: { className?: string }) {
  return (
    <p className={`flex items-start gap-2 text-sm text-success ${className}`}>
      <span aria-hidden="true" className="mt-0.5">
        🔒
      </span>
      <span>
        <strong className="font-bold">Protected by Amana.</strong> Your money is held until you confirm the item
        arrived.
      </span>
    </p>
  )
}
