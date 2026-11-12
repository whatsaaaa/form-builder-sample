<script setup lang="ts">
import type { RowProps, RowSlots } from '@whatsaaaa/form-builder-vue'

defineProps<RowProps>()
defineSlots<RowSlots>()
</script>

<template>
  <!-- One line of a 12-column grid. The stylesheet stacks the cells on a narrow screen. -->
  <div class="row">
    <div
      v-for="(span, index) in spans"
      :key="index"
      class="row__cell"
      :style="{ '--span': span }"
    >
      <slot :index="index" />
    </div>
  </div>
</template>
