import type { JsonField } from '@whatsaaaa/form-builder-schema'

/** The ids of a field's hint and error, for the `aria-describedby` of its input. */
export function describedBy(
  id: string,
  description: string | undefined,
  errors: readonly string[] | null,
): string | undefined {
  const ids = [description && `${id}-hint`, errors && `${id}-error`].filter(
    Boolean,
  )
  return ids.length > 0 ? ids.join(' ') : undefined
}

/**
 * A hint for the renderer from a field's `ui`, like `{ "autocomplete": "email" }`. The
 * definition's `ui` is never checked, so anything but a string or a number counts as no hint.
 */
export function uiHint(field: JsonField, key: string): string | undefined {
  const hint = field.ui?.[key]
  return typeof hint === 'string' || typeof hint === 'number'
    ? String(hint)
    : undefined
}

/** One choice of a select or a radio, as the definition has it. */
export interface Option {
  value: string | number | boolean
  label: string
}

export function optionsOf(field: JsonField): Option[] {
  return (field.options ?? []) as Option[]
}
