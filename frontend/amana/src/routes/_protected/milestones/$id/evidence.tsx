import { createFileRoute } from '@tanstack/react-router'
import { SubmitEvidencePreview } from '../../../../screens/contract'
import { ScreenFrame } from '../../../-ScreenFrame'

export const Route = createFileRoute('/_protected/milestones/$id/evidence')({
  component: () => (
    <ScreenFrame>
      <SubmitEvidencePreview />
    </ScreenFrame>
  ),
})
