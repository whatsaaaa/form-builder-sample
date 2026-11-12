import type { LayoutComponents } from '@whatsaaaa/form-builder-react'
import { LayoutRow } from './LayoutRow'
import { LayoutSection } from './LayoutSection'

/** The component for each layout type. */
export const layoutComponents: LayoutComponents = {
  section: LayoutSection,
  row: LayoutRow,
}
