<script lang="ts">
import type { highlightJson } from './highlight'

type Highlight = typeof highlightJson

// Shiki is most of the app's weight and is needed only once the form is sent, so it is a file of
// its own. It starts loading with the app, and the first render does not wait for it. If the
// file does not load, the code stays plain text.
let loaded: Highlight | undefined
const loading = import('./highlight')
  .then(({ highlightJson }) => {
    loaded = highlightJson
    return highlightJson
  })
  .catch(() => undefined)

/** Lines of plain text, in the block's own text color, for while Shiki is not there. */
function plain(code: string): ReturnType<Highlight> {
  return code.split('\n').map((line) => [{ content: line, offset: 0 }])
}
</script>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'

const props = defineProps<{
  /** A piece of JSON. */
  code: string
  /** The name the caption gives it. */
  file: string
}>()

// The attributes of the block, like a test id, go to its code, so they are on the text alone.
defineOptions({ inheritAttrs: false })

const highlight = shallowRef(loaded)
if (!highlight.value) {
  void loading.then((loadedHighlight) => {
    if (loadedHighlight) highlight.value = loadedHighlight
  })
}

/**
 * The lines, each with the column its wrapped rest starts at: one level in from its own text,
 * so a long value wraps inside the block instead of running out of it.
 */
const lines = computed(() =>
  (highlight.value ?? plain)(props.code).map((tokens) => {
    const text = tokens.map((token) => token.content).join('')
    return { tokens, hang: text.length - text.trimStart().length + 2 }
  }),
)
</script>

<template>
  <!-- What a person typed can be long, so the block wraps its lines instead of scrolling. -->
  <figure class="ws-code ws-code--wrap">
    <figcaption>
      <span>{{ file }}</span>
      <span>json</span>
    </figcaption>
    <!-- A line break ends each line but the last: the text of the block is the code as given. -->
    <pre
      v-bind="$attrs"
    ><code><template v-for="(line, index) in lines" :key="index"><span class="line" :style="{ '--ws-code-hang': line.hang }"><span v-for="(token, column) in line.tokens" :key="column" :style="{ color: token.color }">{{ token.content }}</span></span>{{ index < lines.length - 1 ? '\n' : '' }}</template></code></pre>
  </figure>
</template>
