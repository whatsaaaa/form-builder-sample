import type { ReactNode } from 'react'
import { useLocale } from '../../locale/context'
import { describedBy } from './hints'

interface FieldShellProps {
  id: string
  label?: string
  description?: string
  errors: readonly string[] | null
  required?: boolean
  /** A set of inputs, like radios: a fieldset with a legend instead of a label. */
  group?: boolean
  children: ReactNode
}

/**
 * The frame every field shares: its label, hint and error. No input has a placeholder: the hint,
 * from the definition's `description`, goes under it.
 */
export function FieldShell({
  id,
  label,
  description,
  errors,
  required,
  group,
  children,
}: FieldShellProps) {
  const { t } = useLocale()
  const Frame = group ? 'fieldset' : 'div'
  const Label = group ? 'legend' : 'label'
  const hint = description && (
    <p id={`${id}-hint`} className="field__hint">
      {t(description)}
    </p>
  )
  return (
    <Frame
      className={errors ? 'field field--invalid' : 'field'}
      aria-describedby={
        group ? describedBy(id, description, errors) : undefined
      }
    >
      {label && (
        <Label className="field__label" htmlFor={group ? undefined : id}>
          {t(label)}{' '}
          {required && (
            <span className="field__required" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      {group && hint}
      {children}
      {/* Under a single input, so inputs side by side in a row stay on one line. */}
      {!group && hint}
      {errors && (
        <p id={`${id}-error`} className="field__error">
          {errors[0]}
        </p>
      )}
    </Frame>
  )
}
