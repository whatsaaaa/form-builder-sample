import type { ReactNode } from 'react'

/** A line about what the page is doing, like loading. */
export function StatusLine({ children }: { children: ReactNode }) {
  return (
    <p className="status" role="status">
      {children}
    </p>
  )
}
