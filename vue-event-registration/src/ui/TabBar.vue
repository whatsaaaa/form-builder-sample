<script setup lang="ts">
import { ghostSvg } from '@whatsaaaa/design-system/ghost'
import markOnDark from './assets/mark-on-dark.svg'
import markOnLight from './assets/mark-on-light.svg'

// The ghost as a picture, for a link: on a project's page it links to the handle's site.
const ghost = ghostSvg({ px: 2 })
</script>

<template>
  <header class="ws-tab-bar">
    <span class="ws-tab-bar__brand">
      <!-- The kit has a cut of the mark for each theme. The stylesheet shows the page's one. -->
      <img
        class="tab-bar__mark tab-bar__mark--dark"
        :src="markOnDark"
        alt=""
        width="32"
        height="32"
      />
      <img
        class="tab-bar__mark tab-bar__mark--light"
        :src="markOnLight"
        alt=""
        width="32"
        height="32"
      />
      form-builder
    </span>
    <div class="ws-tab-bar__end">
      <a class="ws-arrow" href="https://whatsaaaa.github.io/form-builder/"
        >docs</a
      >
      <!-- eslint-disable vue/no-v-html -- markup built by the design system's ghost module -->
      <a
        class="tab-bar__ghost"
        href="https://whatsaaaa.github.io/"
        aria-label="A whatsaaaa project"
        v-html="ghost"
      />
      <!-- eslint-enable vue/no-v-html -->
    </div>
  </header>
</template>
