<script setup lang="ts">
import type {
  ArrayFieldProps,
  ArrayFieldSlots,
} from '@whatsaaaa/form-builder-vue'
import { computed } from 'vue'
import { uiHint } from './ui-hints'

const props = defineProps<ArrayFieldProps>()
defineSlots<ArrayFieldSlots>()

// What to call one item, from the definition's `ui`: "Guest 1", "Add a guest".
const itemLabel = computed(() => uiHint(props.field, 'itemLabel') ?? 'Item')

// The list's own `maxLength` rule, if it has one: no Add button once it is full.
const isFull = computed(() => {
  const max = props.field.rules?.find((rule) => rule.rule === 'maxLength')
  return typeof max?.value === 'number' && props.items.length >= max.value
})
</script>

<template>
  <fieldset class="group">
    <legend v-if="field.label" class="group__label">{{ field.label }}</legend>
    <p v-if="field.description" class="group__hint">{{ field.description }}</p>
    <div class="stack">
      <p v-if="items.length === 0" class="list__empty">Nothing added yet.</p>
      <section
        v-for="(item, index) in items"
        :key="item"
        class="list__item"
        :aria-label="`${itemLabel} ${index + 1}`"
      >
        <header class="list__item-header">
          <h3 class="list__item-title">{{ itemLabel }} {{ index + 1 }}</h3>
          <button
            type="button"
            class="button button--quiet"
            @click="remove(index)"
          >
            Remove
            <span class="ws-visually-hidden"
              >{{ itemLabel.toLowerCase() }} {{ index + 1 }}</span
            >
          </button>
        </header>
        <div class="stack">
          <slot :index="index" />
        </div>
      </section>
      <p v-if="errors" class="field__error">{{ errors[0] }}</p>
      <div v-if="!isFull">
        <button type="button" class="button" @click="add()">
          Add {{ itemLabel.toLowerCase() }}
        </button>
      </div>
    </div>
  </fieldset>
</template>
