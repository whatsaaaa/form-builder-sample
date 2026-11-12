import type { RowProps } from '@whatsaaaa/form-builder-react'
import type { CSSProperties } from 'react'

/** One line of a 12-column grid. The stylesheet stacks the cells on a narrow screen. */
export function LayoutRow({ spans, children }: RowProps) {
  return (
    <div className="row">
      {spans.map((span, index) => (
        <div
          key={index}
          className="row__cell"
          style={{ '--span': span } as CSSProperties}
        >
          {children(index)}
        </div>
      ))}
    </div>
  )
}
