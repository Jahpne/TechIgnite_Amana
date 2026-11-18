import type { ReactNode } from 'react'

// Page width wrapper shared by the screen routes. The leading "-" tells the router plugin
// to ignore this file, so it is not turned into a route.
export function ScreenFrame({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <main className={`mx-auto grid w-full content-start gap-4 p-4 ${wide ? 'max-w-4xl' : 'max-w-xl'}`}>
      {children}
    </main>
  )
}
