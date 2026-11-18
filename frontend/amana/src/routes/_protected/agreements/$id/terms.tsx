import { createFileRoute } from '@tanstack/react-router'
import { ReviewTermsPage } from '../../../../pages/ReviewTermsPage'
import { ScreenFrame } from '../../../-ScreenFrame'

export const Route = createFileRoute('/_protected/agreements/$id/terms')({
  component: function Page() {
    const { id } = Route.useParams()
    return (
      <ScreenFrame>
        <ReviewTermsPage id={id} />
      </ScreenFrame>
    )
  },
})
