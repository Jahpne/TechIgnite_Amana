import { AmountInput, Banner, Button, PageTitle, PhoneInput, TextArea, TextField, formatNaira } from '../../ui'
import type { OrderErrors, OrderForm } from './shared'

export interface CreateOrderProps {
  values: OrderForm
  errors: OrderErrors
  loading?: boolean
  /** Server-side failure, shown above the form. */
  error?: string
  /** Set after the order is created. Shows the "Link ready" state. */
  createdLink?: string
  copied?: boolean
  onChange: (field: keyof OrderForm, value: string) => void
  onSubmit: () => void
  onCopy: () => void
  onCreateAnother: () => void
}

/**
 * Six fields in a row read like a form to be endured. Numbering them into
 * three short decisions — what, who, where — makes the task feel finite.
 */
function Step({
  n,
  title,
  hint,
  children,
}: {
  n: number
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft font-display text-sm font-extrabold text-brand"
        >
          {n}
        </span>
        <div className="grid gap-0.5">
          <h2 className="font-display text-[1.0625rem] leading-snug font-bold">{title}</h2>
          {hint && <p className="text-sm text-muted">{hint}</p>}
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  )
}

/** What the buyer will be asked to agree to, kept in view while you type. */
function BuyerPreview({ item, price, phone }: { item: string; price: number; phone: string }) {
  return (
    <aside className="grid h-fit gap-4 rounded-2xl bg-surface-ink p-5 text-white lg:sticky lg:top-24">
      <span className="text-[0.68rem] font-bold tracking-[0.14em] text-white/45 uppercase">
        What your buyer sees
      </span>
      <div className="grid gap-1">
        <p className="font-display text-lg leading-snug font-bold">{item || 'Your item'}</p>
        <p className="font-display text-3xl leading-none font-extrabold tabular-nums">
          {price > 0 ? formatNaira(price) : '₦0'}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-white/60">
        {phone ? `${phone} pays into an account opened for this order. ` : 'Your buyer pays into an account opened for this order. '}
        Amana holds the money until they confirm the item arrived — then it is released to you.
      </p>
      <ul className="m-0 grid list-none gap-2 border-t border-white/10 p-0 pt-4 text-[0.8rem] text-white/55">
        <li>You are not paid before delivery is confirmed.</li>
        <li>Either side can raise a problem and freeze the payout.</li>
      </ul>
    </aside>
  )
}

export function CreateOrder(p: CreateOrderProps) {
  if (p.createdLink) {
    return (
      <div className="mx-auto grid w-full max-w-xl gap-5">
        <div className="grid gap-1.5 text-center">
          <span
            aria-hidden="true"
            className="mx-auto grid size-12 place-items-center rounded-full bg-success-soft text-xl text-success"
          >
            ✓
          </span>
          <h1 className="font-display text-[1.75rem] leading-tight font-extrabold">Your order is ready</h1>
          <p className="text-[0.95rem] text-muted">
            Send this link to your buyer. They review the terms and pay into an account opened for this order.
          </p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-line bg-surface p-5 shadow-card">
          <p className="rounded-xl border border-line bg-surface-2 p-3.5 font-mono text-sm break-all">
            {p.createdLink}
          </p>
          <Button variant="primary" block onClick={p.onCopy}>
            {p.copied ? 'Copied to clipboard' : 'Copy link'}
          </Button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Here is your protected order on Amana: ${p.createdLink}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-5 font-bold transition-colors hover:border-brand-ring hover:bg-surface-2"
          >
            Share on WhatsApp
          </a>
          <span role="status" className="sr-only">
            {p.copied ? 'Link copied to clipboard' : ''}
          </span>
        </div>

        <p className="text-center text-xs leading-relaxed text-muted">
          We email your buyer too. Nothing is owed until they accept the terms.
        </p>

        <Button block onClick={p.onCreateAnother}>
          Create another order
        </Button>
      </div>
    )
  }

  const priceNumber = /^\d+$/.test(p.values.price) ? Number(p.values.price) : 0

  return (
    <div className="grid gap-5">
      <PageTitle
        title="Create a protected order"
        subtitle="The buyer pays into Amana. You are paid after they confirm delivery."
      />
      {p.error && (
        <Banner tone="danger" title="We could not create the order">
          {p.error}
        </Banner>
      )}

      <form
        className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          p.onSubmit()
        }}
      >
        <div className="grid gap-4">
          <Step n={1} title="What you are selling" hint="The buyer sees this before they pay.">
            <TextField
              label="Item"
              value={p.values.item}
              onChange={(v) => p.onChange('item', v)}
              error={p.errors.item}
              placeholder="Samsung phone"
            />
            <AmountInput
              label="Price"
              value={p.values.price}
              onChange={(v) => p.onChange('price', v)}
              error={p.errors.price}
              hint={priceNumber > 0 ? `The buyer will pay ${formatNaira(priceNumber)}.` : 'Whole naira only.'}
            />
          </Step>

          <Step n={2} title="Who is buying" hint="We send them the order and keep them updated.">
            <PhoneInput
              label="Buyer phone number"
              value={p.values.buyerPhone}
              onChange={(v) => p.onChange('buyerPhone', v)}
              error={p.errors.buyerPhone}
            />
          </Step>

          <Step n={3} title="How it gets there" hint="Chowdeck collects from you and delivers to them.">
            <TextArea
              label="Delivery terms"
              value={p.values.deliveryTerms}
              onChange={(v) => p.onChange('deliveryTerms', v)}
              error={p.errors.deliveryTerms}
              placeholder="Chowdeck delivery within Lagos"
            />
            <TextField
              label="Pickup address"
              value={p.values.pickupAddress}
              onChange={(v) => p.onChange('pickupAddress', v)}
              error={p.errors.pickupAddress}
              hint="Where Chowdeck collects the item."
            />
            <TextField
              label="Drop-off address"
              value={p.values.dropoffAddress}
              onChange={(v) => p.onChange('dropoffAddress', v)}
              error={p.errors.dropoffAddress}
              hint="Where the buyer wants it delivered."
            />
          </Step>

          <Button variant="primary" block type="submit" loading={p.loading}>
            Create order and get link
          </Button>
        </div>

        <BuyerPreview item={p.values.item} price={priceNumber} phone={p.values.buyerPhone} />
      </form>
    </div>
  )
}
