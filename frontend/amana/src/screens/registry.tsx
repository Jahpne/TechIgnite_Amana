import type { ReactNode } from 'react'
import '../ui/ui.css'

// Registry of screens for the preview gallery.
// Screen agents: replace the render function on YOUR line only. One line per screen
// keeps parallel edits from conflicting.

export interface ScreenEntry {
  id: string
  title: string
  render: () => ReactNode
  wide?: boolean
}

const placeholder = (id: string, title: string): ReactNode => (
  <section className="card">
    <h2>{id} {title}</h2>
    <p className="muted">Not built yet.</p>
  </section>
)

export const screens: ScreenEntry[] = [
  { id: 'S1', title: 'Sign in', render: () => placeholder('S1', 'Sign in') },
  { id: 'S2', title: 'Order link page', render: () => placeholder('S2', 'Order link page') },
  { id: 'S3', title: 'Create order', render: () => placeholder('S3', 'Create order') },
  { id: 'S4', title: 'Agreement detail', render: () => placeholder('S4', 'Agreement detail') },
  { id: 'S5', title: 'Confirm or report delivery', render: () => placeholder('S5', 'Confirm or report delivery') },
  { id: 'S6', title: 'New contract (AI)', render: () => placeholder('S6', 'New contract (AI)') },
  { id: 'S7', title: 'Review and edit terms', render: () => placeholder('S7', 'Review and edit terms') },
  { id: 'S8', title: 'Submit milestone evidence', render: () => placeholder('S8', 'Submit milestone evidence') },
  { id: 'S9', title: 'Approve milestone', render: () => placeholder('S9', 'Approve milestone') },
  { id: 'S10', title: 'My agreements', render: () => placeholder('S10', 'My agreements') },
  { id: 'S11', title: 'Admin: disputes', wide: true, render: () => placeholder('S11', 'Admin: disputes') },
  { id: 'S12', title: 'Receipt', render: () => placeholder('S12', 'Receipt') },
]
