import { createFileRoute } from '@tanstack/react-router'
import { CreateOrderPreview } from '../../../screens/trade'
import { ScreenFrame } from '../../-ScreenFrame'

export const Route = createFileRoute('/_protected/orders/new')({
  component: () => (
    <ScreenFrame>
      <CreateOrderPreview />
    </ScreenFrame>
  ),
})
