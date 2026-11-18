import { createFileRoute } from '@tanstack/react-router'
import { MyAgreementsPage } from '../../../pages/MyAgreementsPage'
import { ScreenFrame } from '../../-ScreenFrame'

export const Route = createFileRoute('/_protected/agreements/')({
  component: function Page() {
    return (
      <ScreenFrame>
        <MyAgreementsPage />
      </ScreenFrame>
    )
  },
})
