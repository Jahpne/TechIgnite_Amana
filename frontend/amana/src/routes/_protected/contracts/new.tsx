import { createFileRoute } from '@tanstack/react-router'
import { NewContractPage } from '../../../pages/NewContractPage'
import { ScreenFrame } from '../../-ScreenFrame'

export const Route = createFileRoute('/_protected/contracts/new')({
  component: function Page() {
    return (
      <ScreenFrame>
        <NewContractPage />
      </ScreenFrame>
    )
  },
})
