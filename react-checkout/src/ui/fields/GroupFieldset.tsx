import type { GroupFieldProps } from '@whatsaaaa/form-builder-react'
import { useLocale } from '../../locale/context'

export function GroupFieldset({ field, children }: GroupFieldProps) {
  const { t } = useLocale()
  return (
    <fieldset className="group">
      {field.label && (
        <legend className="group__label">{t(field.label)}</legend>
      )}
      {field.description && (
        <p className="group__hint">{t(field.description)}</p>
      )}
      <div className="stack">{children}</div>
    </fieldset>
  )
}
