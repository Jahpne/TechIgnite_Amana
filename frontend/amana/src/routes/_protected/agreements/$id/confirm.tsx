import { createFileRoute } from '@tanstack/react-router'
import { ConfirmDeliveryPage } from '../../../../pages/ConfirmDeliveryPage'
import { ScreenFrame } from '../../../-ScreenFrame'

export const Route = createFileRoute('/_protected/agreements/$id/confirm')({
  component: function Page() {
    const { id } = Route.useParams()
    return (
      <ScreenFrame>
        <ConfirmDeliveryPage id={id} />
      </ScreenFrame>
    )
  },
})
