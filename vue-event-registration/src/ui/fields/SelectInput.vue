<script setup lang="ts">
import type { ValueFieldProps } from '@whatsaaaa/form-builder-vue'
import { computed, useId } from 'vue'
import { describedBy } from './a11y'
import FieldShell from './FieldShell.vue'
import { optionsOf } from './options'
import { uiHint } from './ui-hints'

const props = defineProps<ValueFieldProps>()

const id = useId()
const options = computed(() => optionsOf(props.field))

// An element's value is a string, so each option's index stands for its value.
const selected = computed(() =>
  options.value.findIndex((option) => option.value === props.input),
)
</script>

<template>
  <FieldShell
    :id="id"
    :label="field.label"
    :description="field.description"
    :errors="errors"
    :required="required"
  >
    <select
      v-bind="inputProps"
      :id="id"
      class="input"
      :value="selected"
      :required="required"
      :autocomplete="uiHint(field, 'autocomplete')"
      :aria-invalid="errors ? 'true' : undefined"
      :aria-describedby="describedBy(id, field.description, errors)"
      @change="
        setInput(
          options[Number(($event.target as HTMLSelectElement).value)]?.value,
        )
      "
    >
      <option :value="-1">Choose...</option>
      <option v-for="(option, index) in options" :key="index" :value="index">
        {{ option.label }}
      </option>
    </select>
  </FieldShell>
</template>
