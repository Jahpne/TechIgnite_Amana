import { createFileRoute } from '@tanstack/react-router'
import { ApproveMilestonePage } from '../../../../../../pages/ApproveMilestonePage'
import { ScreenFrame } from '../../../../../-ScreenFrame'

export const Route = createFileRoute('/_protected/agreements/$id/milestones/$milestoneId/review')({
  component: function Page() {
    const { id, milestoneId } = Route.useParams()
    return (
      <ScreenFrame>
        <ApproveMilestonePage id={id} milestoneId={milestoneId} />
      </ScreenFrame>
    )
  },
})
