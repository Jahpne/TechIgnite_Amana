import { createFileRoute } from '@tanstack/react-router'
import { AgreementDetailPreview } from '../../../../screens/trade'
import { ScreenFrame } from '../../../-ScreenFrame'

export const Route = createFileRoute('/_protected/agreements/$id/')({
  component: () => (
    <ScreenFrame>
      <AgreementDetailPreview />
    </ScreenFrame>
  ),
})
