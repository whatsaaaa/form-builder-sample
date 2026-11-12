import type { FieldComponents } from '@whatsaaaa/form-builder-vue'
import CheckboxInput from './CheckboxInput.vue'
import FormDivider from './FormDivider.vue'
import FormHeading from './FormHeading.vue'
import FormParagraph from './FormParagraph.vue'
import GroupFieldset from './GroupFieldset.vue'
import ListRepeater from './ListRepeater.vue'
import MultiselectInput from './MultiselectInput.vue'
import RadioInput from './RadioInput.vue'
import SelectInput from './SelectInput.vue'
import TextareaInput from './TextareaInput.vue'
import TextInput from './TextInput.vue'

/** The component for each field type the app's definitions can use. */
export const components: FieldComponents = {
  text: TextInput,
  email: TextInput,
  password: TextInput,
  url: TextInput,
  tel: TextInput,
  number: TextInput,
  date: TextInput,
  time: TextInput,
  datetime: TextInput,
  textarea: TextareaInput,
  checkbox: CheckboxInput,
  select: SelectInput,
  radio: RadioInput,
  multiselect: MultiselectInput,
  group: GroupFieldset,
  array: ListRepeater,
  heading: FormHeading,
  paragraph: FormParagraph,
  divider: FormDivider,
}
