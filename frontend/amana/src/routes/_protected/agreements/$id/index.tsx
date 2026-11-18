import { createFileRoute } from '@tanstack/react-router'
import { AgreementDetailPage } from '../../../../pages/AgreementDetailPage'
import { ScreenFrame } from '../../../-ScreenFrame'

export const Route = createFileRoute('/_protected/agreements/$id/')({
  component: function Page() {
    const { id } = Route.useParams()
    return (
      <ScreenFrame>
        <AgreementDetailPage id={id} />
      </ScreenFrame>
    )
  },
})
