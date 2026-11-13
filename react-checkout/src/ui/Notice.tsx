import type { ReactNode } from 'react'

interface NoticeProps {
  tone: 'success' | 'error'
  /** What happened. Without one, the notice is its text alone, like a message under a form. */
  title?: string
  children?: ReactNode
}

/** A message about the whole page or form: an order placed, or one that failed. */
export function Notice({ tone, title, children }: NoticeProps) {
  return (
    <section
      className={`notice notice--${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {title ? (
        <>
          <h2 className="notice__title">{title}</h2>
          {children}
        </>
      ) : (
        <p className="notice__message">{children}</p>
      )}
    </section>
  )
}
