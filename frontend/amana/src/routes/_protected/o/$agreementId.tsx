import { createFileRoute } from '@tanstack/react-router'
import { OrderLinkPreview } from '../../../screens/trade'
import { ScreenFrame } from '../../-ScreenFrame'

export const Route = createFileRoute('/_protected/o/$agreementId')({
  component: () => (
    <ScreenFrame>
      <OrderLinkPreview />
    </ScreenFrame>
  ),
})
