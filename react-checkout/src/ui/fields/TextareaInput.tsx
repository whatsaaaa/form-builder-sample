import type { ValueFieldProps } from '@whatsaaaa/form-builder-react'
import { useId } from 'react'
import { FieldShell } from './FieldShell'
import { describedBy } from './hints'

export function TextareaInput({
  field,
  input,
  errors,
  required,
  inputProps,
  setInput,
}: ValueFieldProps) {
  const id = useId()
  return (
    <FieldShell
      id={id}
      label={field.label}
      description={field.description}
      errors={errors}
      required={required}
    >
      <textarea
        {...inputProps}
        id={id}
        className="input input--multiline"
        rows={3}
        value={String(input ?? '')}
        required={required}
        aria-invalid={errors ? true : undefined}
        aria-describedby={describedBy(id, field.description, errors)}
        onChange={(event) => {
          setInput(event.target.value)
        }}
      />
    </FieldShell>
  )
}
