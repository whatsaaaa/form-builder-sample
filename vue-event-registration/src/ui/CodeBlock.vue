<script setup lang="ts">
import { computed } from 'vue'
import { highlightJson } from './highlight'

const props = defineProps<{
  /** A piece of JSON. */
  code: string
  /** The name the caption gives it. */
  file: string
}>()

// The attributes of the block, like a test id, go to its code, so they are on the text alone.
defineOptions({ inheritAttrs: false })

const lines = computed(() => highlightJson(props.code))
</script>

<template>
  <figure class="ws-code">
    <figcaption>
      <span>{{ file }}</span>
      <span>json</span>
    </figcaption>
    <!-- One text node per line break: the text of the block is the code, as it was given. -->
    <pre
      v-bind="$attrs"
    ><code><template v-for="(line, index) in lines" :key="index"><span v-for="(token, column) in line" :key="column" :style="{ color: token.color }">{{ token.content }}</span>{{ index < lines.length - 1 ? '\n' : '' }}</template></code></pre>
  </figure>
</template>
