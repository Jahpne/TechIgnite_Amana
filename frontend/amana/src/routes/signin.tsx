import { createFileRoute } from '@tanstack/react-router'
import { QuickSignIn } from '../pages/QuickSignIn'
import { SignInPage } from '../pages/SignInPage'
import { ScreenFrame } from './-ScreenFrame'

export const Route = createFileRoute('/signin')({
  // ?next=/some/path is where to go after signing in.
  validateSearch: (search: Record<string, unknown>): { next?: string } => ({
    next: typeof search.next === 'string' ? search.next : undefined,
  }),
  component: function Page() {
    const { next } = Route.useSearch()
    return (
      <ScreenFrame>
        <SignInPage next={next} />
        <QuickSignIn compact next={next} />
      </ScreenFrame>
    )
  },
})
