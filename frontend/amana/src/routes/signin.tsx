import { createFileRoute } from '@tanstack/react-router'
import { QuickSignIn } from '../pages/QuickSignIn'
import { SignInPage } from '../pages/SignInPage'
import { AuthAssurance, AuthScene } from '../ui'

export const Route = createFileRoute('/signin')({
  // ?next=/some/path is where to go after signing in.
  validateSearch: (search: Record<string, unknown>): { next?: string } => ({
    next: typeof search.next === 'string' ? search.next : undefined,
  }),
  component: function Page() {
    const { next } = Route.useSearch()
    return (
      <AuthScene
        aside={
          <AuthAssurance
            items={[
              ['Paga holds the money', 'In an account opened for your deal, not ours.'],
              ['Released only when verified', 'Delivery confirmed, or milestone approved.'],
              ['Either side can pause it', 'Raise a problem and the payout freezes.'],
            ]}
          />
        }
        footnote={<QuickSignIn compact next={next} />}
      >
        <SignInPage next={next} />
      </AuthScene>
    )
  },
})
