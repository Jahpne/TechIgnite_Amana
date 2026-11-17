import { useState } from 'react'
import { AmountInput, Banner, Button, Card, PageTitle, PhoneInput, TextArea, TextField, formatNaira } from '../../ui'
import { validateOrder } from './shared'
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

export function CreateOrder(p: CreateOrderProps) {
  if (p.createdLink) {
    return (
      <div className="grid gap-4">
        <PageTitle title="Link ready" subtitle="Send this link to your buyer. They will review the terms and pay." />
        <Card>
          <p className="rounded-lg border border-line bg-surface-2 p-3 font-mono text-sm break-all">{p.createdLink}</p>
          <Button variant="primary" block onClick={p.onCopy}>
            {p.copied ? 'Copied' : 'Copy link'}
          </Button>
          <span role="status" className="sr-only">
            {p.copied ? 'Link copied to clipboard' : ''}
          </span>
          <p className="text-xs text-muted">
            We also notify the buyer by WhatsApp. The money is held by Amana until the buyer confirms delivery.
          </p>
        </Card>
        <Button block onClick={p.onCreateAnother}>
          Create another order
        </Button>
      </div>
    )
  }

  const priceNumber = /^\d+$/.test(p.values.price) ? Number(p.values.price) : 0

  return (
    <div className="grid gap-4">
      <PageTitle title="Create a protected order" subtitle="The buyer pays into Amana. You are paid after they confirm delivery." />
      {p.error && (
        <Banner tone="danger" title="We could not create the order">
          {p.error}
        </Banner>
      )}
      <Card>
        <form
          className="grid gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            p.onSubmit()
          }}
        >
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
          <PhoneInput
            label="Buyer phone number"
            value={p.values.buyerPhone}
            onChange={(v) => p.onChange('buyerPhone', v)}
            error={p.errors.buyerPhone}
          />
          <TextArea
            label="Delivery terms"
            value={p.values.deliveryTerms}
            onChange={(v) => p.onChange('deliveryTerms', v)}
            error={p.errors.deliveryTerms}
            placeholder="Chowdeck delivery within Lagos"
          />
          <Button variant="primary" block type="submit" loading={p.loading}>
            Create order
          </Button>
        </form>
      </Card>
    </div>
  )
}

const empty: OrderForm = { item: '', price: '', buyerPhone: '', deliveryTerms: '' }

export function CreateOrderPreview() {
  const [values, setValues] = useState<OrderForm>(empty)
  const [errors, setErrors] = useState<OrderErrors>({})
  const [link, setLink] = useState<string>()
  const [copied, setCopied] = useState(false)

  return (
    <CreateOrder
      values={values}
      errors={errors}
      createdLink={link}
      copied={copied}
      onChange={(field, value) => {
        setValues((v) => ({ ...v, [field]: value }))
        setErrors((e) => ({ ...e, [field]: undefined }))
      }}
      onSubmit={() => {
        const found = validateOrder(values)
        setErrors(found)
        if (Object.keys(found).length === 0) setLink('https://amana.example/o/ord-1042')
      }}
      onCopy={() => {
        try {
          void navigator.clipboard?.writeText(link ?? '')
        } catch {
          // Clipboard can be blocked. The link is still shown on screen.
        }
        setCopied(true)
      }}
      onCreateAnother={() => {
        setValues(empty)
        setErrors({})
        setLink(undefined)
        setCopied(false)
      }}
    />
  )
}
