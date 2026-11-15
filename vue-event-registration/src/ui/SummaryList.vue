<script setup lang="ts">
defineProps<{
  sections: readonly {
    id: string
    label: string
    rows: readonly { label: string; value: string }[]
  }[]
}>()

/** A value in pieces that end at an "@" or a "/": a long email or URL breaks there. */
function piecesOf(value: string) {
  return value.split(/(?<=[@/])/)
}
</script>

<template>
  <div class="summary">
    <section
      v-for="section in sections"
      :key="section.id"
      class="summary__section"
    >
      <h3 class="summary__title">{{ section.label }}</h3>
      <dl class="ws-pairs">
        <div v-for="(row, index) in section.rows" :key="index">
          <dt>{{ row.label }}</dt>
          <dd>
            <template v-for="(piece, at) in piecesOf(row.value)" :key="at"
              ><wbr v-if="at > 0" />{{ piece }}</template
            >
          </dd>
        </div>
      </dl>
    </section>
  </div>
</template>
