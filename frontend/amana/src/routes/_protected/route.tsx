import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '../../auth/session'
import { AppHeader } from '../../pages/AppHeader'

// Pathless layout: every route inside this _protected folder is nested under it, and
// "_protected" does not appear in the URL. Signed-out visitors go to sign-in and come back
// to the page they asked for. This only improves the experience. The backend still checks
// the token on every request, and answers 401 when it is missing or expired.
export const Route = createFileRoute('/_protected')({
  beforeLoad: ({ location }) => {
    if (!getSession()) {
      throw redirect({ to: '/signin', search: { next: location.href } })
    }
  },
  component: function ProtectedLayout() {
    return (
      <>
        <AppHeader />
        <Outlet />
      </>
    )
  },
})
