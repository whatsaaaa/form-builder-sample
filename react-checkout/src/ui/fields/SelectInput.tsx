import type { ValueFieldProps } from '@whatsaaaa/form-builder-react'
import { useId } from 'react'
import { useLocale } from '../../locale/context'
import { FieldShell } from './FieldShell'
import { describedBy, optionsOf, uiHint } from './hints'

export function SelectInput({
  field,
  input,
  errors,
  required,
  inputProps,
  setInput,
}: ValueFieldProps) {
  const id = useId()
  const { t } = useLocale()
  const options = optionsOf(field)
  // An element's value is a string, so each option's index stands for its value.
  const selected = options.findIndex((option) => option.value === input)
  return (
    <FieldShell
      id={id}
      label={field.label}
      description={field.description}
      errors={errors}
      required={required}
    >
      <select
        {...inputProps}
        id={id}
        className="input"
        value={selected}
        required={required}
        autoComplete={uiHint(field, 'autocomplete')}
        aria-invalid={errors ? true : undefined}
        aria-describedby={describedBy(id, field.description, errors)}
        onChange={(event) => {
          setInput(options[Number(event.target.value)]?.value)
        }}
      >
        <option value={-1}>{t('form.choose')}</option>
        {options.map((option, index) => (
          <option key={index} value={index}>
            {t(option.label)}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}
