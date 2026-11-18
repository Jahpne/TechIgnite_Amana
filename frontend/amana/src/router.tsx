import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// File-based routing: each file in src/routes is one path. The router plugin (vite.config.ts)
// generates routeTree.gen.ts from that folder when the dev server or a build runs.
// Do not edit routeTree.gen.ts by hand.
export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
