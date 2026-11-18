import { createFileRoute } from '@tanstack/react-router'
import { ConfirmDeliveryPreview } from '../../../../screens/trade'
import { ScreenFrame } from '../../../-ScreenFrame'

export const Route = createFileRoute('/_protected/agreements/$id/confirm')({
  component: () => (
    <ScreenFrame>
      <ConfirmDeliveryPreview />
    </ScreenFrame>
  ),
})
