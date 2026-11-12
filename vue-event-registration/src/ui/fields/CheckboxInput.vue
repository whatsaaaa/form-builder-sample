<script setup lang="ts">
import type { ValueFieldProps } from '@whatsaaaa/form-builder-vue'
import { useId } from 'vue'
import { describedBy } from './a11y'

defineProps<ValueFieldProps>()

const id = useId()
</script>

<template>
  <div class="field" :class="{ 'field--invalid': errors }">
    <label class="choice">
      <input
        v-bind="inputProps"
        class="choice__input"
        type="checkbox"
        :checked="input === true"
        :required="required"
        :aria-invalid="errors ? 'true' : undefined"
        :aria-describedby="describedBy(id, field.description, errors)"
        @change="setInput(($event.target as HTMLInputElement).checked)"
      />
      <span class="choice__label">
        {{ field.label }}
        <span v-if="required" class="field__required" aria-hidden="true"
          >*</span
        >
      </span>
    </label>
    <p v-if="field.description" :id="`${id}-hint`" class="field__hint">
      {{ field.description }}
    </p>
    <p v-if="errors" :id="`${id}-error`" class="field__error">
      {{ errors[0] }}
    </p>
  </div>
</template>
