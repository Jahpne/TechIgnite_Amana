import { createFileRoute } from '@tanstack/react-router'
import { PayoutAccountPage } from '../../../pages/PayoutAccountPage'
import { ScreenFrame } from '../../-ScreenFrame'

export const Route = createFileRoute('/_protected/payouts/account')({
  // ?next=/some/path returns the user to what they were doing.
  validateSearch: (search: Record<string, unknown>): { next?: string } => ({
    next: typeof search.next === 'string' ? search.next : undefined,
  }),
  component: function Page() {
    const { next } = Route.useSearch()
    return (
      <ScreenFrame>
        <PayoutAccountPage next={next} />
      </ScreenFrame>
    )
  },
})
