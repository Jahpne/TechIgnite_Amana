import type { ReactNode } from 'react'

// Page width wrapper shared by the screen routes. The leading "-" tells the router plugin
// to ignore this file, so it is not turned into a route.
//
// Both widths centre in the column the sidebar leaves. A capped column that is
// also left-aligned piles every spare pixel on the right and reads as lopsided.
// "wide" is for screens that work the whole column — lists, dashboards, the
// two-column forms. The default stays a readable measure for things that are
// mostly prose: terms, receipts, a single evidence review.
export function ScreenFrame({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div
      className={`mx-auto grid w-full content-start gap-5 px-5 pt-7 pb-12 lg:px-10 xl:px-14 ${
        wide ? 'max-w-[1700px]' : 'max-w-3xl'
      }`}
    >
      {children}
    </div>
  )
}
