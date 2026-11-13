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

/**
 * The lines, each with the column its wrapped rest starts at: one level in from its own text,
 * so a long value wraps inside the block instead of running out of it.
 */
const lines = computed(() =>
  highlightJson(props.code).map((tokens) => {
    const text = tokens.map((token) => token.content).join('')
    return { tokens, hang: text.length - text.trimStart().length + 2 }
  }),
)
</script>

<template>
  <figure class="ws-code">
    <figcaption>
      <span>{{ file }}</span>
      <span>json</span>
    </figcaption>
    <!-- A line break ends each line but the last: the text of the block is the code as given. -->
    <pre
      v-bind="$attrs"
      class="code"
    ><code><span v-for="(line, index) in lines" :key="index" class="code__line" :style="{ '--hang': line.hang }"><span v-for="(token, column) in line.tokens" :key="column" :style="{ color: token.color }">{{ token.content }}</span>{{ index < lines.length - 1 ? '\n' : '' }}</span></code></pre>
  </figure>
</template>
