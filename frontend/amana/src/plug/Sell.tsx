import { useState } from 'react'
import { Button, Card, PageTitle, TextArea, TextField, formatNaira } from '../ui'
import { CATEGORIES } from './data'
import { PlugShell, ProtectedNote } from './PlugShell'

/** Interface only: nothing is saved yet. */
export function Sell() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [blurb, setBlurb] = useState('')
  const [posted, setPosted] = useState(false)

  const priceNumber = /^\d+$/.test(price) ? Number(price) : 0

  if (posted) {
    return (
      <PlugShell>
        <div className="mx-auto grid max-w-md gap-4 text-center">
          <span
            aria-hidden="true"
            className="mx-auto grid size-12 place-items-center rounded-full bg-success-soft text-xl text-success"
          >
            ✓
          </span>
          <PageTitle title="Your listing is live" subtitle="Buyers can find it on Plug and pay with protection." />
          <Button variant="primary" block onClick={() => setPosted(false)}>
            List something else
          </Button>
        </div>
      </PlugShell>
    )
  }

  return (
    <PlugShell>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="grid gap-5">
          <PageTitle
            title="List something"
            subtitle="Buyers pay into Amana, not to you. You are paid once they confirm it arrived."
          />

          <Card>
            <TextField
              label="What are you selling?"
              placeholder="Samsung Galaxy A54, 128GB"
              value={title}
              onChange={setTitle}
            />

            <div className="grid gap-1.5">
              <span className="text-sm font-bold">Category</span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    aria-pressed={category === c.value}
                    onClick={() => setCategory(c.value)}
                    className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-bold transition-colors ${
                      category === c.value
                        ? 'border-transparent bg-ink text-on-brand'
                        : 'border-line bg-surface text-muted hover:border-brand-ring hover:text-ink'
                    }`}
                  >
                    <span aria-hidden="true">{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <TextField
              label="Price"
              inputMode="numeric"
              placeholder="180000"
              hint={priceNumber > 0 ? `Buyers will see ${formatNaira(priceNumber)}.` : 'Whole naira only.'}
              value={price}
              onChange={(v) => setPrice(v.replace(/\D/g, ''))}
            />

            <TextArea
              label="Description"
              placeholder="Condition, what is included, how fast you can deliver."
              value={blurb}
              onChange={setBlurb}
            />

            <Button
              variant="primary"
              block
              disabled={title.trim() === '' || priceNumber <= 0}
              onClick={() => setPosted(true)}
            >
              Post listing
            </Button>
          </Card>
        </div>

        <aside className="grid h-fit gap-4 rounded-2xl bg-surface-ink p-5 text-white lg:sticky lg:top-24">
          <span className="text-[0.68rem] font-bold tracking-[0.14em] text-white/45 uppercase">
            Why buyers trust Plug
          </span>
          <ol className="m-0 grid list-none gap-3.5 p-0">
            {[
              ['They pay into Amana', 'Not to you, and not to us. The money is held for that one deal.'],
              ['You send the item', 'Hand it to the courier and the buyer is notified.'],
              ['They confirm it arrived', 'That is what releases the money to your bank.'],
            ].map(([t, b], i) => (
              <li key={t} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/15 text-[0.65rem] font-black"
                >
                  {i + 1}
                </span>
                <span className="text-[0.82rem] leading-snug">
                  <strong className="block font-bold">{t}</strong>
                  <span className="text-white/60">{b}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="border-t border-white/10 pt-4 text-[0.78rem] leading-relaxed text-white/50">
            Buyers are far likelier to pay a stranger when the money is held. That is the whole point of Plug.
          </p>
        </aside>
      </div>

      <ProtectedNote className="justify-center" />
    </PlugShell>
  )
}
