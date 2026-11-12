<script setup lang="ts">
import type { ValueFieldProps } from '@whatsaaaa/form-builder-vue'
import { computed, useId } from 'vue'
import FieldShell from './FieldShell.vue'
import { optionsOf, type Option } from './options'

const props = defineProps<ValueFieldProps>()

const id = useId()
const options = computed(() => optionsOf(props.field))
const picked = computed(() =>
  Array.isArray(props.input) ? (props.input as Option['value'][]) : [],
)

// Keeps the picked values in the order of the options, whatever order they were ticked in.
function toggle(value: Option['value'], checked: boolean) {
  props.setInput(
    options.value
      .map((option) => option.value)
      .filter((each) =>
        each === value ? checked : picked.value.includes(each),
      ),
  )
}
</script>

<template>
  <FieldShell
    :id="id"
    group
    :label="field.label"
    :description="field.description"
    :errors="errors"
    :required="required"
  >
    <div class="choices">
      <label v-for="(option, index) in options" :key="index" class="choice">
        <input
          v-bind="inputProps"
          class="choice__input"
          type="checkbox"
          :checked="picked.includes(option.value)"
          :aria-invalid="errors ? 'true' : undefined"
          @change="
            toggle(option.value, ($event.target as HTMLInputElement).checked)
          "
        />
        <span class="choice__label">{{ option.label }}</span>
      </label>
    </div>
  </FieldShell>
</template>
