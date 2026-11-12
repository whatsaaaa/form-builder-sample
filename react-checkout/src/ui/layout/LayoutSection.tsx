import type { SectionProps } from '@whatsaaaa/form-builder-react'
import { useLocale } from '../../locale/context'

/**
 * A block of the form with a title. With `"ui": { "variant": "plain" }` it has no frame of its
 * own, like the column that holds the other sections.
 */
export function LayoutSection({ section, children }: SectionProps) {
  const { t } = useLocale()
  if (section.ui?.variant === 'plain') {
    return <div className="stack">{children}</div>
  }
  return (
    <section className="card" aria-label={t(section.label)}>
      {section.label && <h2 className="card__title">{t(section.label)}</h2>}
      {section.description && (
        <p className="card__lead">{t(section.description)}</p>
      )}
      <div className="stack">{children}</div>
    </section>
  )
}
