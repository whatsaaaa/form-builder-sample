<script setup lang="ts">
import { enableShortcuts, isTyping } from '@whatsaaaa/design-system/shortcuts'
import { toggleTheme } from '@whatsaaaa/design-system/theme'
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * NORMAL while single keys are shortcuts, INSERT while they are typed into a field. It says
 * whether the key hints next to it work right now.
 */
const mode = ref<'NORMAL' | 'INSERT'>('NORMAL')

function updateMode() {
  mode.value = isTyping(document.activeElement) ? 'INSERT' : 'NORMAL'
}

let disableShortcuts: (() => void) | undefined
onMounted(() => {
  updateMode()
  document.addEventListener('focusin', updateMode)
  document.addEventListener('focusout', updateMode)
  disableShortcuts = enableShortcuts()
})
onUnmounted(() => {
  document.removeEventListener('focusin', updateMode)
  document.removeEventListener('focusout', updateMode)
  disableShortcuts?.()
})
</script>

<template>
  <footer class="ws-status-line" aria-label="Status">
    <span class="ws-status-line__mode">{{ mode }}</span>
    <!-- The room left in the line, which the path shows in whole or not at all. -->
    <span class="ws-status-line__path">
      <span class="ws-status-line__file"
        ><span>~/vue-event-registration</span></span
      >
    </span>
    <!-- Each hint is the control it names: the key clicks the button. -->
    <span class="ws-status-line__keys">
      <button
        type="button"
        data-ws-key="t"
        aria-label="Switch theme"
        @click="toggleTheme"
      >
        <kbd class="ws-kbd">t</kbd>theme
      </button>
    </span>
    <!-- The shortcuts module gives the switch its state. Until then the styles keep it hidden. -->
    <button
      type="button"
      class="ws-status-line__switch"
      role="switch"
      aria-label="Shortcut keys"
      data-ws-keys-switch
    >
      keys
      <span class="ws-status-line__on" aria-hidden="true">on</span>
      <span class="ws-status-line__off" aria-hidden="true">off</span>
    </button>
    <!--
      The name of the theme, which also switches it: the hints above are hidden on a narrow
      screen, and this is not. Both names are in the button and the styles show the theme's one,
      so it keeps the focus when the theme changes.
    -->
    <button type="button" class="ws-status-line__theme" @click="toggleTheme">
      <span class="ws-visually-hidden">Switch theme, now </span>
      <span class="ws-theme-dark">rose-pine</span>
      <span class="ws-theme-light">rose-pine-dawn</span>
    </button>
  </footer>
</template>
