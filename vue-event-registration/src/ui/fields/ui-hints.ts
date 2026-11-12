import type { JsonField } from '@whatsaaaa/form-builder-schema'

/**
 * A text hint for the renderer from a field's `ui`, like `{ "autocomplete": "email" }`. The
 * definition's `ui` is never checked, so anything but a string counts as no hint.
 */
export function uiHint(field: JsonField, key: string): string | undefined {
  const hint = field.ui?.[key]
  return typeof hint === 'string' ? hint : undefined
}
