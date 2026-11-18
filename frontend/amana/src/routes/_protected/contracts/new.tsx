import { createFileRoute } from '@tanstack/react-router'
import { NewContractPreview } from '../../../screens/contract'
import { ScreenFrame } from '../../-ScreenFrame'

export const Route = createFileRoute('/_protected/contracts/new')({
  component: () => (
    <ScreenFrame>
      <NewContractPreview />
    </ScreenFrame>
  ),
})
