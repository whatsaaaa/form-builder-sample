<script setup lang="ts">
defineProps<{
  /** The label of each step on show, in order. */
  steps: readonly string[]
  /** The index of the current step. */
  current: number
}>()

defineEmits<{ goTo: [index: number] }>()
</script>

<template>
  <nav aria-label="Progress">
    <ol class="steps">
      <li
        v-for="(label, index) in steps"
        :key="index"
        class="steps__item"
        :class="{
          'steps__item--current': index === current,
          'steps__item--done': index < current,
        }"
      >
        <button
          type="button"
          class="steps__button"
          :aria-current="index === current ? 'step' : undefined"
          @click="$emit('goTo', index)"
        >
          <!-- A step behind the current one passed its checks: it shows a tick for its number. -->
          <span class="steps__number" aria-hidden="true">{{
            index < current ? '' : index + 1
          }}</span>
          <span class="steps__label">{{ label }}</span>
          <span v-if="index < current" class="ws-visually-hidden">(done)</span>
        </button>
      </li>
    </ol>
  </nav>
</template>
