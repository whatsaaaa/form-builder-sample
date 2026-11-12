<script setup lang="ts">
import type { ValueFieldProps } from '@whatsaaaa/form-builder-vue'
import { computed, useId } from 'vue'
import FieldShell from './FieldShell.vue'
import { optionsOf } from './options'

const props = defineProps<ValueFieldProps>()

const id = useId()
const options = computed(() => optionsOf(props.field))
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
          type="radio"
          :checked="option.value === input"
          :aria-invalid="errors ? 'true' : undefined"
          @change="setInput(option.value)"
        />
        <span class="choice__label">{{ option.label }}</span>
      </label>
    </div>
  </FieldShell>
</template>
