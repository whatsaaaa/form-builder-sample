import type { ValueFieldProps } from '@whatsaaaa/form-builder-react'
import { useId } from 'react'
import { useLocale } from '../../locale/context'
import { FieldShell } from './FieldShell'
import { describedBy, uiHint } from './hints'

// The native input for each type. The rest are text.
const inputTypes: Record<string, string> = {
  email: 'email',
  password: 'password',
  number: 'number',
  url: 'url',
  tel: 'tel',
  date: 'date',
  time: 'time',
  datetime: 'datetime-local',
}

export function TextInput({
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
      label={field.label}
      description={field.description}
      errors={errors}
      required={required}
    >
      <input
        {...inputProps}
        id={id}
        className="input"
        type={inputTypes[field.type] ?? 'text'}
        value={String(input ?? '')}
        placeholder={field.placeholder && t(field.placeholder)}
        required={required}
        min={uiHint(field, 'min')}
        max={uiHint(field, 'max')}
        inputMode={uiHint(field, 'inputmode') as 'numeric' | undefined}
        autoComplete={uiHint(field, 'autocomplete')}
        aria-invalid={errors ? true : undefined}
        aria-describedby={describedBy(id, field.description, errors)}
        onChange={(event) => {
          setInput(event.target.value)
        }}
      />
    </FieldShell>
  )
}
