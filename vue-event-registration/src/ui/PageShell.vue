<script setup lang="ts">
import StatusLine from './StatusLine.vue'
import TabBar from './TabBar.vue'

defineProps<{ title: string; lead?: string }>()
</script>

<template>
  <!-- The design system's terminal frame: a window with a tab bar on top and a status line. -->
  <div class="page ws-term">
    <TabBar />
    <main class="page__main">
      <div class="page__content">
        <header class="page__header">
          <h1 class="page__title">{{ title }}</h1>
          <p v-if="lead" class="page__lead">{{ lead }}</p>
        </header>
        <slot />
      </div>
    </main>
    <StatusLine />
  </div>
</template>
