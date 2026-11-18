import { createFileRoute } from '@tanstack/react-router'
import { ReviewTermsPreview } from '../../../../screens/contract'
import { ScreenFrame } from '../../../-ScreenFrame'

export const Route = createFileRoute('/_protected/agreements/$id/terms')({
  component: () => (
    <ScreenFrame>
      <ReviewTermsPreview />
    </ScreenFrame>
  ),
})
