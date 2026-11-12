<script setup lang="ts">
import { describedBy } from './a11y'

// The frame every field shares: its label, hint and error. A set of inputs, like radios, is a
// fieldset with a legend instead of a label.
defineProps<{
  id: string
  label?: string
  description?: string
  errors: readonly string[] | null
  required?: boolean
  group?: boolean
}>()
</script>

<template>
  <component
    :is="group ? 'fieldset' : 'div'"
    class="field"
    :class="{ 'field--invalid': errors }"
    :aria-describedby="group ? describedBy(id, description, errors) : undefined"
  >
    <component
      :is="group ? 'legend' : 'label'"
      v-if="label"
      class="field__label"
      :for="group ? undefined : id"
    >
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true">*</span>
    </component>
    <p v-if="description && group" :id="`${id}-hint`" class="field__hint">
      {{ description }}
    </p>
    <slot />
    <!-- Under a single input, so inputs side by side in a row stay on one line. -->
    <p v-if="description && !group" :id="`${id}-hint`" class="field__hint">
      {{ description }}
    </p>
    <p v-if="errors" :id="`${id}-error`" class="field__error">
      {{ errors[0] }}
    </p>
  </component>
</template>
