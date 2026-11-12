<script setup lang="ts">
defineProps<{
  isFirst: boolean
  isLast: boolean
  submitLabel: string
}>()

defineEmits<{ back: [] }>()
</script>

<template>
  <div class="actions">
    <button v-if="!isFirst" type="button" class="button" @click="$emit('back')">
      Back
    </button>
    <!-- Always a submit button: before the last step, a submit moves to the next one, so Enter
         in a text input does too. -->
    <button type="submit" class="button button--primary">
      {{ isLast ? submitLabel : 'Next' }}
    </button>
  </div>
</template>
