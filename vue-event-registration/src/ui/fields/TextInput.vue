<script setup lang="ts">
import type { ValueFieldProps } from '@whatsaaaa/form-builder-vue'
import { useId } from 'vue'
import { describedBy } from './a11y'
import FieldShell from './FieldShell.vue'
import { uiHint } from './ui-hints'

defineProps<ValueFieldProps>()

const id = useId()

// The native input for each type. The rest are text.
const inputTypes: Record<string, string> = {
  email: 'email',
  password: 'password',
  number: 'number',
  url: 'url',
  tel: 'tel',
  date: 'date',
  time: 'time',
  datetime: 'datetime-local',
}
</script>

<template>
  <FieldShell
    :id="id"
    :label="field.label"
    :description="field.description"
    :errors="errors"
    :required="required"
  >
    <input
      v-bind="inputProps"
      :id="id"
      class="input"
      :type="inputTypes[field.type] ?? 'text'"
      :value="input ?? ''"
      :placeholder="field.placeholder"
      :required="required"
      :autocomplete="uiHint(field, 'autocomplete')"
      :aria-invalid="errors ? 'true' : undefined"
      :aria-describedby="describedBy(id, field.description, errors)"
      @input="setInput(($event.target as HTMLInputElement).value)"
    />
  </FieldShell>
</template>
