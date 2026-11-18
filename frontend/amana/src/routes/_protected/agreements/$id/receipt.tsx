import { createFileRoute } from '@tanstack/react-router'
import { ReceiptPreview } from '../../../../screens/lists'
import { ScreenFrame } from '../../../-ScreenFrame'

export const Route = createFileRoute('/_protected/agreements/$id/receipt')({
  component: () => (
    <ScreenFrame>
      <ReceiptPreview />
    </ScreenFrame>
  ),
})
