import { Link } from '@tanstack/react-router'
import { Button, Card, formatNaira } from '../ui'
import { findListing } from './data'
import { PlugShell, ProtectedNote } from './PlugShell'

export function ListingDetail({ id }: { id: string }) {
  const listing = findListing(id)

  if (!listing) {
    return (
      <PlugShell>
        <p className="py-10 text-center text-muted">That listing is no longer available.</p>
        <Link to="/plug" className="text-center font-bold">
          Back to Plug
        </Link>
      </PlugShell>
    )
  }

  return (
    <PlugShell>
      <Link to="/plug" className="text-sm font-bold text-muted no-underline hover:text-ink">
        ← Back
      </Link>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-4">
          <span
            aria-hidden="true"
            className="grid aspect-[4/3] place-items-center rounded-2xl border border-line bg-surface-2 text-7xl sm:text-8xl"
          >
            {listing.emoji}
          </span>
          <div className="grid gap-2">
            <h1 className="font-display text-[1.6rem] leading-tight font-extrabold">{listing.title}</h1>
            <p className="text-[0.95rem] leading-relaxed text-muted">{listing.blurb}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:sticky lg:top-24">
          <Card>
            <span className="font-display text-3xl leading-none font-extrabold tabular-nums">
              {formatNaira(listing.price)}
            </span>
            <ProtectedNote />
            <Button variant="primary" block>
              Buy with Amana
            </Button>
            <p className="text-xs leading-relaxed text-muted">
              You will review the terms before paying. Nothing is charged until you accept.
            </p>
          </Card>

          <Card title="Seller">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft font-display font-extrabold text-brand"
              >
                {listing.seller.charAt(0)}
              </span>
              <span className="grid gap-0.5">
                <span className="font-bold">{listing.seller}</span>
                <span className="text-sm text-muted">{listing.location}</span>
              </span>
            </div>
            <p className="text-sm text-muted">
              <strong className="font-bold text-ink">{listing.deals}</strong> deals completed through Amana.
            </p>
            <p className="text-xs leading-relaxed text-muted">
              A completed deal means a buyer confirmed they got what they paid for. It is not a rating or a
              guarantee.
            </p>
          </Card>
        </div>
      </div>
    </PlugShell>
  )
}
