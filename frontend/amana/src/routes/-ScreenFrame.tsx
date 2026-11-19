import type { ReactNode } from 'react'

// Page width wrapper shared by the screen routes. The leading "-" tells the router plugin
// to ignore this file, so it is not turned into a route.
export function ScreenFrame({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto grid w-full content-start gap-5 px-4 pt-6 pb-10 ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}>
      {children}
    </div>
  )
}
