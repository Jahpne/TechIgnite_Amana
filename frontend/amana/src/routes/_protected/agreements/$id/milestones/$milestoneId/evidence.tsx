import { createFileRoute } from '@tanstack/react-router'
import { SubmitEvidencePage } from '../../../../../../pages/SubmitEvidencePage'
import { ScreenFrame } from '../../../../../-ScreenFrame'

export const Route = createFileRoute('/_protected/agreements/$id/milestones/$milestoneId/evidence')({
  component: function Page() {
    const { id, milestoneId } = Route.useParams()
    return (
      <ScreenFrame>
        <SubmitEvidencePage id={id} milestoneId={milestoneId} />
      </ScreenFrame>
    )
  },
})
