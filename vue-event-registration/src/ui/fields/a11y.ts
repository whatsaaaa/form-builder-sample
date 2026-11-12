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
