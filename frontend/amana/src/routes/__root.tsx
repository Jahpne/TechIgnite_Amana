import { createRootRoute } from '@tanstack/react-router'
import { RootLayout } from '../App'

export const Route = createRootRoute({
  component: RootLayout,
  // ?frame=phone shows the 360px phone frame in the dev gallery.
  validateSearch: (search: Record<string, unknown>): { frame?: 'phone' } =>
    search.frame === 'phone' ? { frame: 'phone' } : {},
})
