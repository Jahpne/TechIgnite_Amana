import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { formatNaira } from '../ui'
import { CATEGORIES, LISTINGS } from './data'
import type { Category } from './data'
import { PlugShell } from './PlugShell'

export function Browse() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')

  const visible = LISTINGS.filter((l) => {
    const matchesCategory = category === 'all' || l.category === category
    const q = query.trim().toLowerCase()
    const matchesQuery = q === '' || `${l.title} ${l.seller} ${l.location}`.toLowerCase().includes(q)
    return matchesCategory && matchesQuery
  })

  return (
    <PlugShell>
      <section className="grid gap-4 rounded-3xl bg-surface-ink p-6 text-white sm:p-8">
        <h1 className="font-display text-[1.9rem] leading-[1.1] font-extrabold sm:text-[2.4rem]">
          Buy from anyone.
          <br />
          Pay like you know them.
        </h1>
        <p className="max-w-lg text-[0.95rem] leading-relaxed text-white/70">
          Your money is held until the item arrives and you say so. If it never comes, you get it back.
        </p>
        <label className="mt-1 flex items-center gap-2 rounded-full bg-white px-4 py-1">
          <span aria-hidden="true" className="text-muted">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search phones, fashion, services…"
            aria-label="Search listings"
            className="min-h-11 w-full bg-transparent text-ink outline-none placeholder:text-muted/70"
          />
        </label>
      </section>

      <div className="flex flex-wrap gap-2">
        {[{ value: 'all' as const, label: 'Everything', emoji: '✨' }, ...CATEGORIES].map((c) => {
          const active = category === c.value
          return (
            <button
              key={c.value}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(c.value)}
              className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition-colors ${
                active
                  ? 'border-transparent bg-ink text-on-brand'
                  : 'border-line bg-surface text-muted hover:border-brand-ring hover:text-ink'
              }`}
            >
              <span aria-hidden="true">{c.emoji}</span>
              {c.label}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-muted">Nothing matches that yet.</p>
      ) : (
        <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:gap-4 lg:grid-cols-4">
          {visible.map((l) => (
            <li key={l.id}>
              <Link
                to="/plug/$id"
                params={{ id: l.id }}
                className="group grid h-full gap-3 rounded-2xl border border-line bg-surface p-3 no-underline shadow-card transition-all hover:-translate-y-px hover:border-brand-ring"
              >
                <span
                  aria-hidden="true"
                  className="grid aspect-square place-items-center rounded-xl bg-surface-2 text-4xl sm:text-5xl"
                >
                  {l.emoji}
                </span>
                <span className="grid gap-1">
                  <span className="line-clamp-2 text-sm leading-snug font-bold text-ink">{l.title}</span>
                  <span className="font-display text-lg leading-none font-extrabold tabular-nums text-ink">
                    {formatNaira(l.price)}
                  </span>
                  <span className="text-xs text-muted">{l.location}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PlugShell>
  )
}
