// Pure helpers for the trade screens. No React, no fetching.

/** Accepts 0803..., +234803... or 234803... with optional spaces or dashes. */
export function isValidNigerianPhone(value: string): boolean {
  const digits = value.replace(/[\s-]/g, '')
  return /^(0|\+234|234)[789][01]\d{8}$/.test(digits)
}

export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export interface OrderForm {
  item: string
  price: string
  buyerPhone: string
  deliveryTerms: string
  pickupAddress: string
  dropoffAddress: string
}

export type OrderErrors = Partial<Record<keyof OrderForm, string>>

/** Price is a positive whole number of naira. The backend still validates everything. */
export function validateOrder(v: OrderForm): OrderErrors {
  const errors: OrderErrors = {}
  if (v.item.trim().length < 2) errors.item = 'Enter the item you are selling.'
  if (!/^\d+$/.test(v.price) || Number(v.price) <= 0) {
    errors.price = 'Enter a price greater than zero, in whole naira.'
  }
  if (!isValidNigerianPhone(v.buyerPhone)) {
    errors.buyerPhone = 'Enter a valid Nigerian phone number, for example 0801 234 5678.'
  }
  if (v.deliveryTerms.trim().length < 5) {
    errors.deliveryTerms = 'Describe the delivery terms, for example "Chowdeck delivery within Lagos".'
  }
  if (v.pickupAddress.trim().length < 3) errors.pickupAddress = 'Enter the pickup address.'
  if (v.dropoffAddress.trim().length < 3) errors.dropoffAddress = 'Enter the drop-off address.'
  return errors
}

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
