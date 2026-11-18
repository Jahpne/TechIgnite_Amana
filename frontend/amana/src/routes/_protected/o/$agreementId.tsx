import { createFileRoute } from '@tanstack/react-router'
import { OrderLinkPage } from '../../../pages/OrderLinkPage'
import { ScreenFrame } from '../../-ScreenFrame'

export const Route = createFileRoute('/_protected/o/$agreementId')({
  component: function Page() {
    const { agreementId } = Route.useParams()
    return (
      <ScreenFrame>
        <OrderLinkPage id={agreementId} />
      </ScreenFrame>
    )
  },
})
