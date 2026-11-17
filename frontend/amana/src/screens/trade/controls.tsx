import { useId } from 'react'
import type { ReactNode } from 'react'

// Preview-only controls used by the *Preview wrappers in the gallery.

export function SelectControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  const id = useId()
  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor={id} className="font-semibold text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="min-h-11 flex-1 rounded-lg border border-line bg-surface px-2 text-ink"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function PreviewPanel({ children }: { children: ReactNode }) {
  return (
    <div
      role="group"
      aria-label="Preview controls"
      className="grid gap-2 rounded-lg border border-dashed border-line bg-surface-2 p-3"
    >
      <span className="text-xs font-bold tracking-wider text-muted uppercase">Preview controls</span>
      {children}
    </div>
  )
}
