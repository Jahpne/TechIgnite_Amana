/**
 * Amana Plug — mock catalogue.
 *
 * Interface only: nothing here talks to the backend yet. When it does, a
 * listing becomes the seed for a protected order rather than a new concept.
 */
export interface Listing {
  id: string
  title: string
  price: number
  seller: string
  location: string
  category: Category
  /** Stands in for a photo until real uploads exist. */
  emoji: string
  blurb: string
  deals: number
}

export type Category = 'phones' | 'fashion' | 'services' | 'home' | 'food'

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'phones', label: 'Phones & tech', emoji: '📱' },
  { value: 'fashion', label: 'Fashion', emoji: '👟' },
  { value: 'services', label: 'Services', emoji: '🛠️' },
  { value: 'home', label: 'Home', emoji: '🛋️' },
  { value: 'food', label: 'Food', emoji: '🍲' },
]

export const LISTINGS: Listing[] = [
  {
    id: 'samsung-a54',
    title: 'Samsung Galaxy A54, 128GB',
    price: 180_000,
    seller: 'Tunde Electronics',
    location: 'Ikeja, Lagos',
    category: 'phones',
    emoji: '📱',
    blurb: 'UK used, clean screen, battery health 92%. Comes with charger and case.',
    deals: 34,
  },
  {
    id: 'air-force',
    title: 'Nike Air Force 1, size 43',
    price: 45_000,
    seller: 'Kicks by Ada',
    location: 'Uyo, Akwa Ibom',
    category: 'fashion',
    emoji: '👟',
    blurb: 'Brand new in box. Swap allowed within 24 hours of delivery.',
    deals: 112,
  },
  {
    id: 'wedding-photos',
    title: 'Wedding photography, full day',
    price: 250_000,
    seller: 'Grace Frames',
    location: 'Uyo, Akwa Ibom',
    category: 'services',
    emoji: '📷',
    blurb: 'Full day cover and 60 edited photos, delivered within two weeks. Paid per milestone.',
    deals: 19,
  },
  {
    id: 'shop-shelving',
    title: 'Shop shelving, built and installed',
    price: 180_000,
    seller: 'David Works',
    location: 'Ikeja, Lagos',
    category: 'services',
    emoji: '🪚',
    blurb: 'Measured, built and fitted in your shop. Half on measurement, half on install.',
    deals: 8,
  },
  {
    id: 'macbook-air',
    title: 'MacBook Air M2, 256GB',
    price: 920_000,
    seller: 'Tunde Electronics',
    location: 'Ikeja, Lagos',
    category: 'phones',
    emoji: '💻',
    blurb: 'Apple care until March. Original box, 41 cycles.',
    deals: 34,
  },
  {
    id: 'ankara-set',
    title: 'Ankara two-piece, made to measure',
    price: 38_000,
    seller: 'Nneka Stitches',
    location: 'Aba, Abia',
    category: 'fashion',
    emoji: '🧵',
    blurb: 'Send your measurements. Ready in 7 days, photos before dispatch.',
    deals: 61,
  },
  {
    id: 'center-table',
    title: 'Glass centre table',
    price: 85_000,
    seller: 'Homebase NG',
    location: 'Port Harcourt',
    category: 'home',
    emoji: '🪑',
    blurb: 'Tempered glass, steel frame. Delivery within Port Harcourt included.',
    deals: 27,
  },
  {
    id: 'small-chops',
    title: 'Small chops tray, serves 20',
    price: 25_000,
    seller: "Mama's Kitchen",
    location: 'Uyo, Akwa Ibom',
    category: 'food',
    emoji: '🍢',
    blurb: 'Puff puff, spring rolls, samosa, peppered chicken. Order 24 hours ahead.',
    deals: 143,
  },
]

export const findListing = (id: string) => LISTINGS.find((l) => l.id === id)
