import { createFileRoute } from '@tanstack/react-router'
import { AdminDisputesPage } from '../../../pages/AdminDisputesPage'
import { ScreenFrame } from '../../-ScreenFrame'

export const Route = createFileRoute('/_protected/admin/disputes')({
  component: function Page() {
    return (
      <ScreenFrame wide>
        <AdminDisputesPage />
      </ScreenFrame>
    )
  },
})
