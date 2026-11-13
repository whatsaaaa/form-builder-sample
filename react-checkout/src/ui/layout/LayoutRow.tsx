import type { RowProps } from '@whatsaaaa/form-builder-react'
import type { CSSProperties } from 'react'

/**
 * One line of a 12-column grid. The stylesheet stacks the cells on a narrow screen. A row of
 * sections is the page's columns, with room between them for the sections' own titles.
 */
export function LayoutRow({ row, spans, children }: RowProps) {
  const ofSections = row.items.some(
    (item) =>
      typeof item === 'object' && 'type' in item && item.type === 'section',
  )
  return (
    <div className={ofSections ? 'row row--sections' : 'row'}>
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
