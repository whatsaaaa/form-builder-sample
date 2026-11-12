import type { FieldComponents } from '@whatsaaaa/form-builder-react'
import { CheckboxInput } from './CheckboxInput'
import { GroupFieldset } from './GroupFieldset'
import { ListRepeater } from './ListRepeater'
import { RadioInput } from './RadioInput'
import { SelectInput } from './SelectInput'
import { TextareaInput } from './TextareaInput'
import { TextInput } from './TextInput'

/** The component for each field type the checkout's definition can use. */
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
  group: GroupFieldset,
  array: ListRepeater,
}
