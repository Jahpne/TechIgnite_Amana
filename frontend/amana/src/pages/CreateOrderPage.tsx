import { useState } from 'react'
import { nairaToKobo } from '../api/mappers'
import { toE164 } from '../auth/phone'
import { useCreateTrade } from '../hooks/actions'
import { errorMessage } from '../hooks/errors'
import { CreateOrder } from '../screens/trade/CreateOrder'
import { validateOrder } from '../screens/trade/shared'
import type { OrderErrors, OrderForm } from '../screens/trade/shared'

const empty: OrderForm = {
  item: '',
  price: '',
  buyerPhone: '',
  deliveryTerms: '',
  pickupAddress: '',
  dropoffAddress: '',
}

export function CreateOrderPage() {
  const create = useCreateTrade()
  const [values, setValues] = useState<OrderForm>(empty)
  const [errors, setErrors] = useState<OrderErrors>({})
  const [link, setLink] = useState<string>()
  const [copied, setCopied] = useState(false)

  const submit = () => {
    const found = validateOrder(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    create.mutate(
      {
        title: values.item.trim(),
        amount: nairaToKobo(Number(values.price)),
        buyerPhone: toE164(values.buyerPhone),
        deliveryTerms: values.deliveryTerms.trim(),
        pickupAddress: values.pickupAddress.trim(),
        dropoffAddress: values.dropoffAddress.trim(),
        createdVia: 'WEB',
      },
      { onSuccess: (agreement) => setLink(`${window.location.origin}/o/${agreement.id}`) },
    )
  }

  return (
    <CreateOrder
      values={values}
      errors={errors}
      loading={create.isPending}
      error={create.error ? errorMessage(create.error) : undefined}
      createdLink={link}
      copied={copied}
      onChange={(field, value) => {
        setValues((v) => ({ ...v, [field]: value }))
        setErrors((e) => ({ ...e, [field]: undefined }))
      }}
      onSubmit={submit}
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
        create.reset()
      }}
    />
  )
}
