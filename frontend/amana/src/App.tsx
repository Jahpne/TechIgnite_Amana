import { Link, Outlet, useSearch } from '@tanstack/react-router'
import { screens } from './screens/registry'

// Root layout and dev gallery. The logic workstream owns real route guards, loaders and
// the final layout, and will extend router.tsx and replace this file as needed.

export function RootLayout() {
  const { frame } = useSearch({ strict: false }) as { frame?: 'phone' }
  const phone = frame === 'phone'

  return (
    <div className={phone ? 'min-h-dvh bg-surface-2 py-4' : 'min-h-dvh'}>
      <div
        className={
          phone
            ? 'mx-auto min-h-[640px] w-[360px] overflow-hidden rounded-3xl border-4 border-ink/80 bg-page shadow-xl'
            : ''
        }
      >
        <Outlet />
      </div>
    </div>
  )
}

export function Gallery() {
  const { frame } = useSearch({ strict: false }) as { frame?: 'phone' }
  const phone = frame === 'phone'

  return (
    <main className="mx-auto grid max-w-2xl gap-4 p-4">
      <header className="grid gap-1">
        <h1 className="text-2xl font-bold text-brand">Amana UI preview</h1>
        <p className="text-sm text-muted">Developer gallery. Every screen with mock data.</p>
      </header>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">Viewport</span>
        <Link
          to="/gallery"
          search={phone ? {} : { frame: 'phone' }}
          className="inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-4 text-sm font-semibold no-underline"
        >
          {phone ? 'Switch to full width' : 'Switch to 360px phone frame'}
        </Link>
      </div>

      <ul className="grid gap-2">
        {screens.map((s) => (
          <li key={s.id}>
            <a
              href={`${s.sample}${phone ? '?frame=phone' : ''}`}
              className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-2 no-underline hover:bg-surface-2"
            >
              <span>
                <strong>{s.id}</strong> {s.title}
              </span>
              <code className="text-xs text-muted">{s.path}</code>
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
