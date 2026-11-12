<script setup lang="ts">
import type { DisplayFieldProps } from '@whatsaaaa/form-builder-vue'
import { computed } from 'vue'

const props = defineProps<DisplayFieldProps>()

const level = computed(() =>
  typeof props.field.level === 'number' ? props.field.level : 2,
)
</script>

<template>
  <component :is="`h${level}`" class="heading">{{ field.text }}</component>
</template>
