import { createFileRoute } from '@tanstack/react-router'
import { SignInPreview } from '../screens/trade'
import { ScreenFrame } from './-ScreenFrame'

export const Route = createFileRoute('/signin')({
  component: () => (
    <ScreenFrame>
      <SignInPreview />
    </ScreenFrame>
  ),
})
