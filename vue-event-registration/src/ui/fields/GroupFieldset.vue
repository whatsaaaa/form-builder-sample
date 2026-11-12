<script setup lang="ts">
import type {
  GroupFieldProps,
  GroupFieldSlots,
} from '@whatsaaaa/form-builder-vue'

defineProps<GroupFieldProps>()
defineSlots<GroupFieldSlots>()
</script>

<template>
  <fieldset class="group">
    <legend v-if="field.label" class="group__label">{{ field.label }}</legend>
    <p v-if="field.description" class="group__hint">{{ field.description }}</p>
    <div class="stack">
      <slot />
    </div>
  </fieldset>
</template>
