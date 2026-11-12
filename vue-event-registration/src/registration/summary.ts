import type {
  FieldNode,
  LayoutStep,
  VisibilityState,
} from '@whatsaaaa/form-builder-vue'
import { optionsOf } from '../ui/fields/options'
import { uiHint } from '../ui/fields/ui-hints'

export interface SummaryRow {
  label: string
  value: string
}

export interface SummarySection {
  id: string
  label: string
  rows: SummaryRow[]
}

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** A field's value as text: the label of an option, "Yes" for a ticked checkbox, a day in words. */
function formatValue(node: FieldNode, value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => formatValue(node, item)).join(', ')
  }
  const option = optionsOf(node.field).find((each) => each.value === value)
  if (option) return option.label
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (node.type === 'date' && typeof value === 'string') {
    const day = new Date(`${value}T00:00:00Z`)
    return Number.isNaN(day.getTime()) ? value : dayFormat.format(day)
  }
  return String(value)
}

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

function read(input: unknown, path: readonly (string | number)[]): unknown {
  let value = input
  for (const key of path) {
    if (typeof value !== 'object' || value === null) return undefined
    value = (value as Record<string | number, unknown>)[key]
  }
  return value
}

/** One row per item of a list of objects: "Guest 1" with the item's values in a line. */
function listRows(
  node: FieldNode,
  items: readonly unknown[],
  visibility: VisibilityState,
): SummaryRow[] {
  const itemLabel =
    uiHint(node.field, 'itemLabel') ?? node.field.label ?? 'Item'
  return items.map((item, index) => ({
    label: `${itemLabel} ${index + 1}`,
    value: node.children
      .filter(
        (child) =>
          child.role === 'value' && !visibility.isHidden(child, [index]),
      )
      .map((child) => [child, read(item, [child.field.name ?? ''])] as const)
      .filter(([, value]) => !isEmpty(value))
      .map(([child, value]) => formatValue(child, value))
      .join(', '),
  }))
}

/**
 * What the user entered, as text, for a review before they submit: one section per step, with a
 * row for every field that is on show and filled in. It reads the definition's layout, so it
 * follows the form when the definition changes.
 */
export function summarize(
  steps: readonly LayoutStep[],
  visibility: VisibilityState,
  input: unknown,
): SummarySection[] {
  return steps
    .map((step, index) => {
      const rows: SummaryRow[] = []
      for (const node of step.fields) {
        // The fields of a list's items are told with their list.
        if (node.dataPath.includes('*') || visibility.isHidden(node, [])) {
          continue
        }
        const value = read(input, node.dataPath)
        if (node.role === 'array' && node.children.length > 0) {
          if (Array.isArray(value)) {
            rows.push(...listRows(node, value, visibility))
          }
        } else if (node.role === 'value' && !isEmpty(value)) {
          rows.push({
            label: node.field.label ?? String(node.field.name),
            value: formatValue(node, value),
          })
        }
      }
      return {
        id: step.step.id ?? String(index),
        label: step.step.label ?? `Step ${index + 1}`,
        rows,
      }
    })
    .filter((section) => section.rows.length > 0)
}
