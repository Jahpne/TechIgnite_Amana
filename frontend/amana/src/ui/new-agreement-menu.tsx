import { useEffect, useRef, useState } from 'react'
import { Button } from './primitives'

/**
 * One entry point instead of two side-by-side buttons.
 *
 * An order and a contract are the same decision — "start something" — so they
 * belong behind one control, with the choice made after the click.
 */
export function NewAgreementMenu({
  onCreateOrder,
  onNewContract,
  block,
}: {
  onCreateOrder: () => void
  onNewContract: () => void
  block?: boolean
}) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const choose = (run: () => void) => () => {
    setOpen(false)
    run()
  }

  const item =
    'flex w-full cursor-pointer items-start gap-3 rounded-xl border-0 bg-transparent px-3 py-2.5 text-left transition-colors hover:bg-surface-2'

  return (
    <div ref={wrap} className={`relative ${block ? 'w-full' : ''}`}>
      <Button
        variant="primary"
        block={block}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true" className="text-lg leading-none">
          +
        </span>
        New agreement
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-line bg-surface p-1.5 shadow-lift"
        >
          <button type="button" role="menuitem" className={item} onClick={choose(onCreateOrder)}>
            <span aria-hidden="true" className="mt-0.5 text-lg">
              🛒
            </span>
            <span className="grid gap-0.5">
              <span className="text-sm font-bold text-ink">Create an order</span>
              <small className="text-xs text-muted">Selling something. Paid on delivery.</small>
            </span>
          </button>
          <button type="button" role="menuitem" className={item} onClick={choose(onNewContract)}>
            <span aria-hidden="true" className="mt-0.5 text-lg">
              📝
            </span>
            <span className="grid gap-0.5">
              <span className="text-sm font-bold text-ink">Start a contract</span>
              <small className="text-xs text-muted">Hiring someone. Paid per milestone.</small>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
