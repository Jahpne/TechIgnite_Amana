import { Outlet } from '@tanstack/react-router'

// Root layout. Every page renders inside it.
export function RootLayout() {
  return (
    <div className="min-h-dvh">
      <Outlet />
    </div>
  )
}
