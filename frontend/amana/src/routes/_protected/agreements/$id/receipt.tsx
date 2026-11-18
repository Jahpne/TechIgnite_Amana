import { createFileRoute } from '@tanstack/react-router'
import { ReceiptPage } from '../../../../pages/ReceiptPage'
import { ScreenFrame } from '../../../-ScreenFrame'

export const Route = createFileRoute('/_protected/agreements/$id/receipt')({
  component: function Page() {
    const { id } = Route.useParams()
    return (
      <ScreenFrame>
        <ReceiptPage id={id} />
      </ScreenFrame>
    )
  },
})
