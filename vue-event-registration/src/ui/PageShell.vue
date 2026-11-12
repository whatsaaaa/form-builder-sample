<script setup lang="ts">
defineProps<{ title: string; lead?: string }>()
</script>

<template>
  <main class="page">
    <header class="page__header">
      <h1 class="page__title">{{ title }}</h1>
      <p v-if="lead" class="page__lead">{{ lead }}</p>
    </header>
    <slot />
  </main>
</template>
