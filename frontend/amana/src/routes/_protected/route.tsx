import { Outlet, createFileRoute } from '@tanstack/react-router'

// Pathless layout: every route inside this _protected folder is nested under it, and
// "_protected" does not appear in the URL. Add the sign-in check here (beforeLoad) once and it
// covers every screen below. It does not redirect yet.
//
// beforeLoad: ({ location }) => {
//   if (!getSession()) throw redirect({ to: '/signin', search: { next: location.href } })
// },
export const Route = createFileRoute('/_protected')({
  component: Outlet,
})
