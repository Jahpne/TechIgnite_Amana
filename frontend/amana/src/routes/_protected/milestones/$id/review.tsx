import { createFileRoute } from '@tanstack/react-router'
import { ApproveMilestonePreview } from '../../../../screens/contract'
import { ScreenFrame } from '../../../-ScreenFrame'

export const Route = createFileRoute('/_protected/milestones/$id/review')({
  component: () => (
    <ScreenFrame>
      <ApproveMilestonePreview />
    </ScreenFrame>
  ),
})
