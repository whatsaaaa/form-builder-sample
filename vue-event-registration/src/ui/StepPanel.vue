<script setup lang="ts">
import { useTemplateRef } from 'vue'

defineProps<{ title?: string; lead?: string }>()

const heading = useTemplateRef('heading')

defineExpose({
  /** Moves focus to the title, for when another step comes on show. */
  focusTitle: () => heading.value?.focus(),
})
</script>

<template>
  <section class="form__step" aria-labelledby="step-title">
    <h2 id="step-title" ref="heading" class="form__step-title" tabindex="-1">
      {{ title }}
    </h2>
    <p v-if="lead" class="form__step-lead">{{ lead }}</p>
    <div class="stack">
      <slot />
    </div>
  </section>
</template>
