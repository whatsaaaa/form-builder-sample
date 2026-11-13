import type { ReactNode } from 'react'

/**
 * A line about what the page is doing, like loading. Not the status line of the window: this
 * one is in the page, where the form will be.
 */
export function StatusMessage({ children }: { children: ReactNode }) {
  return (
    <p className="status-message" role="status">
      {children}
    </p>
  )
}
