<script setup lang="ts">
import type { SectionProps, SectionSlots } from '@whatsaaaa/form-builder-vue'

defineProps<SectionProps>()
defineSlots<SectionSlots>()
</script>

<template>
  <fieldset class="group">
    <legend v-if="section.label" class="group__label">
      {{ section.label }}
    </legend>
    <p v-if="section.description" class="group__hint">
      {{ section.description }}
    </p>
    <div class="stack">
      <slot />
    </div>
  </fieldset>
</template>
