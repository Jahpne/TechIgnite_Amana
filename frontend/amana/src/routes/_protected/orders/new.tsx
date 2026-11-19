import { createFileRoute } from '@tanstack/react-router'
import { CreateOrderPage } from '../../../pages/CreateOrderPage'
import { ScreenFrame } from '../../-ScreenFrame'

export const Route = createFileRoute('/_protected/orders/new')({
  component: function Page() {
    return (
      <ScreenFrame wide>
        <CreateOrderPage />
      </ScreenFrame>
    )
  },
})
