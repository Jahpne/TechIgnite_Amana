import { createFileRoute } from '@tanstack/react-router'
import { AdminDisputesPreview } from '../../../screens/lists'
import { ScreenFrame } from '../../-ScreenFrame'

export const Route = createFileRoute('/_protected/admin/disputes')({
  component: () => (
    <ScreenFrame wide>
      <AdminDisputesPreview />
    </ScreenFrame>
  ),
})
