import type { ValueFieldProps } from '@whatsaaaa/form-builder-react'
import { useId } from 'react'
import { useLocale } from '../../locale/context'
import { describedBy } from './hints'

export function CheckboxInput({
  field,
  input,
  errors,
  required,
  inputProps,
  setInput,
}: ValueFieldProps) {
  const id = useId()
  const { t } = useLocale()
  return (
    <div className={errors ? 'field field--invalid' : 'field'}>
      <label className="choice">
        <input
          {...inputProps}
          className="choice__input"
          type="checkbox"
          checked={input === true}
          required={required}
          aria-invalid={errors ? true : undefined}
          aria-describedby={describedBy(id, field.description, errors)}
          onChange={(event) => {
            setInput(event.target.checked)
          }}
        />
        <span className="choice__label">
          {t(field.label)}{' '}
          {required && (
            <span className="field__required" aria-hidden="true">
              *
            </span>
          )}
        </span>
      </label>
      {field.description && (
        <p id={`${id}-hint`} className="field__hint">
          {t(field.description)}
        </p>
      )}
      {errors && (
        <p id={`${id}-error`} className="field__error">
          {errors[0]}
        </p>
      )}
    </div>
  )
}
