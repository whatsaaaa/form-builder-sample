<script setup lang="ts">
defineProps<{ code: string }>()
</script>

<template>
  <pre class="notice__code">{{ code }}</pre>
</template>
