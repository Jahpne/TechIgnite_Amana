import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useCurrentUser, useSignOut } from '../hooks/auth'

/**
 * Dark rail on desktop, bottom tab bar on mobile.
 *
 * The rail is ink rather than white so the warm page reads as the work surface
 * and navigation stays visually out of the way — the same split Proxy uses.
 */
type Item = { to: string; label: string; short: string; icon: ReactNode }

const Icon = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-5 shrink-0"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
)

const PATH = {
  doc: 'M14 3v5h5M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM9 13h6M9 17h4',
  cart: 'M3 4h2l2.4 10.3a2 2 0 0 0 2 1.7h6.9a2 2 0 0 0 2-1.6L20 8H6M9 20h.01M17 20h.01',
  pen: 'M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17zM14 7l3 3',
  scale: 'M12 4v16M7 20h10M5 8h14M5 8l-2 5a3 3 0 0 0 6 0zM19 8l2 5a3 3 0 0 1-6 0z',
  bank: 'M3 10h18M5 10v8M19 10v8M9 10v8M15 10v8M3 18h18M12 3l9 4H3z',
}

const NAV: Item[] = [
  { to: '/agreements', label: 'My agreements', short: 'Agreements', icon: <Icon d={PATH.doc} /> },
  { to: '/orders/new', label: 'New order', short: 'Order', icon: <Icon d={PATH.cart} /> },
  { to: '/contracts/new', label: 'New contract', short: 'Contract', icon: <Icon d={PATH.pen} /> },
]

const ADMIN: Item = { to: '/admin/disputes', label: 'Disputes', short: 'Disputes', icon: <Icon d={PATH.scale} /> }
const PAYOUT: Item = { to: '/payouts/account', label: 'Payout account', short: 'Payout', icon: <Icon d={PATH.bank} /> }

const railLink =
  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/65 no-underline transition-colors hover:bg-white/10 hover:text-white'
const railActive = { className: `${railLink} bg-brand text-on-brand hover:bg-brand hover:text-on-brand` }

const tabLink = 'flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.62rem] font-bold text-muted no-underline'
const tabActive = { className: `${tabLink} text-brand` }

function initials(from: string) {
  const parts = from.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return from.replace(/\D/g, '').slice(-2) || from.slice(0, 2).toUpperCase()
}

export function AppShell({ children }: { children: ReactNode }) {
  const me = useCurrentUser()
  const signOut = useSignOut()
  const name = me.data?.name?.trim()
  const phone = me.data?.phone ?? ''
  const nav = me.data?.isAdmin ? [...NAV, ADMIN] : NAV

  return (
    <div className="min-h-dvh bg-page text-ink lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 bg-surface-ink px-4 py-6 lg:flex print:hidden">
        <Link to="/" className="flex items-center gap-2.5 px-1 no-underline">
          <span className="grid size-9 place-items-center rounded-xl bg-brand font-display text-lg font-extrabold text-on-brand">
            a
          </span>
          <span className="leading-none">
            <span className="block font-display text-xl font-extrabold tracking-tight text-white">Amana</span>
            <small className="mt-1 block text-[0.6rem] font-semibold tracking-[0.14em] text-white/45 uppercase">
              Agree · Verify · Pay
            </small>
          </span>
        </Link>

        {/* Who you are signed in as — the rail is also the account surface. */}
        <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-3 py-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-extrabold text-brand-strong">
            {initials(name || phone || 'A')}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-bold text-white">{name || phone || 'Signed in'}</span>
            {name && phone && <small className="block truncate text-xs text-white/50">{phone}</small>}
          </span>
        </div>

        <nav aria-label="Main" className="grid gap-1">
          {nav.map((item) => (
            <Link key={item.to} to={item.to} className={railLink} activeProps={railActive}>
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto grid gap-1 border-t border-white/10 pt-4">
          <Link to={PAYOUT.to} className={railLink} activeProps={railActive}>
            {PAYOUT.icon}
            {PAYOUT.label}
          </Link>
          <button
            type="button"
            onClick={signOut}
            className={`${railLink} w-full cursor-pointer border-0 bg-transparent text-left`}
          >
            <Icon d="M15 17l5-5-5-5M20 12H9M12 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-surface-ink px-4 py-3 lg:hidden print:hidden">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-sm font-extrabold text-on-brand">
            a
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-white">Amana</span>
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="min-h-9 cursor-pointer rounded-full border border-white/20 bg-transparent px-3.5 text-xs font-bold text-white"
        >
          Sign out
        </button>
      </header>

      {/* Extra bottom padding on mobile so the tab bar never covers an action. */}
      <main className="pb-24 lg:pb-0">{children}</main>

      {/* Mobile tab bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface/95 backdrop-blur-md lg:hidden print:hidden"
      >
        {[...nav, PAYOUT].map((item) => (
          <Link key={item.to} to={item.to} className={tabLink} activeProps={tabActive}>
            {item.icon}
            {item.short}
          </Link>
        ))}
      </nav>
    </div>
  )
}
