import type { ValueFieldProps } from '@whatsaaaa/form-builder-react'
import { useId } from 'react'
import { useLocale } from '../../locale/context'
import { FieldShell } from './FieldShell'
import { optionsOf } from './hints'

export function RadioInput({
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
    <FieldShell
      id={id}
      group
      label={field.label}
      description={field.description}
      errors={errors}
      required={required}
    >
      <div className="choices">
        {optionsOf(field).map((option, index) => (
          <label key={index} className="choice">
            <input
              {...inputProps}
              className="choice__input"
              type="radio"
              checked={option.value === input}
              aria-invalid={errors ? true : undefined}
              onChange={() => {
                setInput(option.value)
              }}
            />
            <span className="choice__label">{t(option.label)}</span>
          </label>
        ))}
      </div>
    </FieldShell>
  )
}
