import { Link } from '@tanstack/react-router'
import { useCurrentUser, useSignOut } from '../hooks/auth'

const link = 'rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap text-ink no-underline hover:bg-surface-2'
const active = { className: `${link} bg-brand-soft text-brand-strong` }

// Shown on every signed-in page: where you are, where you can go, and how to sign out.
export function AppHeader() {
  const me = useCurrentUser()
  const signOut = useSignOut()
  const who = me.data?.name?.trim() || me.data?.phone

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-brand no-underline">
          amana
        </Link>

        <nav aria-label="Main" className="order-last flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:w-auto">
          <Link to="/agreements" className={link} activeProps={active}>
            My agreements
          </Link>
          <Link to="/orders/new" className={link} activeProps={active}>
            New order
          </Link>
          <Link to="/contracts/new" className={link} activeProps={active}>
            New contract
          </Link>
          {me.data?.isAdmin && (
            <Link to="/admin/disputes" className={link} activeProps={active}>
              Disputes
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {who && <span className="hidden max-w-40 truncate text-sm text-muted sm:inline">{who}</span>}
          <button
            type="button"
            onClick={signOut}
            className="min-h-11 rounded-full border border-line bg-surface px-4 text-sm font-semibold hover:bg-surface-2"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
