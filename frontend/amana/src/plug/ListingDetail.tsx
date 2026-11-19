import { Link, useNavigate } from '@tanstack/react-router'
import { nairaToKobo } from '../api/mappers'
import { useCreatePurchase } from '../hooks/actions'
import { useCurrentUser } from '../hooks/auth'
import { errorMessage } from '../hooks/errors'
import { Button, Card, ErrorState, formatNaira } from '../ui'
import { findListing } from './data'
import { PlugShell, ProtectedNote } from './PlugShell'

export function ListingDetail({ id }: { id: string }) {
  const listing = findListing(id)
  const navigate = useNavigate()
  const me = useCurrentUser()
  const buy = useCreatePurchase()
  const signedIn = Boolean(me.data)

  // Signed out, the listing is still worth reading, so sending the buyer to
  // sign in carries them back here rather than dropping them on a dashboard.
  function onBuy() {
    if (!listing) return
    if (!signedIn) {
      void navigate({ to: '/signin', search: { next: `/plug/${listing.id}` } })
      return
    }
    buy.mutate(
      {
        title: listing.title,
        amount: nairaToKobo(listing.price),
        sellerPhone: listing.sellerPhone,
        listingRef: listing.id,
        deliveryTerms: `Pickup from ${listing.location}. Buyer confirms receipt.`,
      },
      {
        // The order comes back already awaiting payment, so this lands on the
        // screen showing the account to pay into.
        onSuccess: (agreement) => void navigate({ to: '/agreements/$id', params: { id: agreement.id } }),
      },
    )
  }

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
            <Button variant="primary" block loading={buy.isPending} onClick={onBuy}>
              {signedIn ? 'Buy with Amana' : 'Sign in to buy'}
            </Button>
            {buy.isError && <ErrorState message={errorMessage(buy.error)} />}
            <p className="text-xs leading-relaxed text-muted">
              Your money goes to an account opened for this order. The seller is paid only once you
              confirm you got it.
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
