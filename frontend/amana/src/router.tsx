import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { Gallery, RootLayout } from './App'
import { screens } from './screens/registry'

// Code-based TanStack Router tree, built from the screen registry.
// The logic workstream owns real route guards (sign-in redirects, party checks) and
// loaders, and will extend this file. Screens themselves stay presentational.

const rootRoute = createRootRoute({
  component: RootLayout,
  // ?frame=phone shows the 360px phone frame in the dev gallery.
  validateSearch: (search: Record<string, unknown>): { frame?: 'phone' } =>
    search.frame === 'phone' ? { frame: 'phone' } : {},
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Gallery,
})

const screenRoutes = screens.map((s) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: s.path,
    component: () => (
      <main className={`mx-auto grid w-full content-start gap-4 p-4 ${s.wide ? 'max-w-4xl' : 'max-w-xl'}`}>
        {s.render()}
      </main>
    ),
  }),
)

const routeTree = rootRoute.addChildren([indexRoute, ...screenRoutes])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
