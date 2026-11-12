<script setup lang="ts">
import type { ValueFieldProps } from '@whatsaaaa/form-builder-vue'
import { useId } from 'vue'
import { describedBy } from './a11y'
import FieldShell from './FieldShell.vue'

defineProps<ValueFieldProps>()

const id = useId()
</script>

<template>
  <FieldShell
    :id="id"
    :label="field.label"
    :description="field.description"
    :errors="errors"
    :required="required"
  >
    <textarea
      v-bind="inputProps"
      :id="id"
      class="input input--multiline"
      rows="4"
      :value="String(input ?? '')"
      :placeholder="field.placeholder"
      :required="required"
      :aria-invalid="errors ? 'true' : undefined"
      :aria-describedby="describedBy(id, field.description, errors)"
      @input="setInput(($event.target as HTMLTextAreaElement).value)"
    />
  </FieldShell>
</template>
