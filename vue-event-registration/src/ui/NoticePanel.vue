<script setup lang="ts">
defineProps<{ title: string; tone?: 'success' | 'error' }>()
</script>

<template>
  <section
    class="notice"
    :class="`notice--${tone ?? 'success'}`"
    :role="tone === 'error' ? 'alert' : 'status'"
  >
    <h2 class="notice__title">{{ title }}</h2>
    <slot />
  </section>
</template>
