import type { JsonField } from '@whatsaaaa/form-builder-schema'

/** One choice of a select, a radio or a multiselect, as the definition has it. */
export interface Option {
  value: string | number | boolean
  label: string
}

export function optionsOf(field: JsonField): Option[] {
  return (field.options ?? []) as Option[]
}
