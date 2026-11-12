<script setup lang="ts">
defineProps<{
  sections: readonly {
    id: string
    label: string
    rows: readonly { label: string; value: string }[]
  }[]
}>()
</script>

<template>
  <div class="summary">
    <section
      v-for="section in sections"
      :key="section.id"
      class="summary__section"
    >
      <h3 class="summary__title">{{ section.label }}</h3>
      <dl class="summary__rows">
        <div
          v-for="(row, index) in section.rows"
          :key="index"
          class="summary__row"
        >
          <dt class="summary__term">{{ row.label }}</dt>
          <dd class="summary__value">{{ row.value }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>
