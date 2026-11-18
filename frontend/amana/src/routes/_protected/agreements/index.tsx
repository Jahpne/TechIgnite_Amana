import { createFileRoute } from '@tanstack/react-router'
import { MyAgreementsPreview } from '../../../screens/lists'
import { ScreenFrame } from '../../-ScreenFrame'

export const Route = createFileRoute('/_protected/agreements/')({
  component: () => (
    <ScreenFrame>
      <MyAgreementsPreview />
    </ScreenFrame>
  ),
})
