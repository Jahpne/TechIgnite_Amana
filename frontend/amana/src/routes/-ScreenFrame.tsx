import type { ReactNode } from 'react'

// Page width wrapper shared by the screen routes. The leading "-" tells the router plugin
// to ignore this file, so it is not turned into a route.
//
// The sidebar already takes a fixed column, so the content fills what is left
// rather than sitting in a narrow centred strip with dead space beside it. The
// cap only stops lines running away on very wide monitors.
export function ScreenFrame({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div
      className={`grid w-full content-start gap-5 px-5 pt-7 pb-12 lg:px-9 xl:px-12 ${
        wide ? 'max-w-[1440px]' : 'max-w-[1100px]'
      }`}
    >
      {children}
    </div>
  )
}
