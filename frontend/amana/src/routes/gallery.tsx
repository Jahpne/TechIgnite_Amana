import { createFileRoute } from '@tanstack/react-router'
import { Gallery } from '../App'

// Dev-only screen gallery. Remove or hide it before a real release.
export const Route = createFileRoute('/gallery')({
  component: Gallery,
})
