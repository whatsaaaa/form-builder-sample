import type { LayoutComponents } from '@whatsaaaa/form-builder-vue'
import LayoutRow from './LayoutRow.vue'
import LayoutSection from './LayoutSection.vue'

/** The component for each layout type. */
export const layoutComponents: LayoutComponents = {
  section: LayoutSection,
  row: LayoutRow,
}
