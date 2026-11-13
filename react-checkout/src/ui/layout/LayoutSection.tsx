import type { SectionProps } from '@whatsaaaa/form-builder-react'
import { useLocale } from '../../locale/context'

/**
 * A part of the checkout with a title, like a step of a longer form. With
 * `"ui": { "variant": "plain" }` it has no title of its own, like the column that holds the
 * other sections.
 */
export function LayoutSection({ section, children }: SectionProps) {
  const { t } = useLocale()
  if (section.ui?.variant === 'plain') {
    return <div className="sections">{children}</div>
  }
  return (
    <section className="section" aria-label={t(section.label)}>
      {section.label && <h2 className="section__title">{t(section.label)}</h2>}
      {section.description && (
        <p className="section__lead">{t(section.description)}</p>
      )}
      <div className="stack">{children}</div>
    </section>
  )
}
