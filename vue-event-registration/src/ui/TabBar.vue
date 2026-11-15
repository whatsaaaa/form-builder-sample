<script setup lang="ts">
import ghostOnDark from './assets/ghost-on-dark.svg'
import ghostOnLight from './assets/ghost-on-light.svg'
import markOnDark from './assets/mark-on-dark.svg'
import markOnLight from './assets/mark-on-light.svg'
</script>

<template>
  <header class="ws-tab-bar">
    <span class="ws-tab-bar__brand">
      <!-- The kit has a cut of the mark for each theme. The styles show the page's one. -->
      <img
        class="tab-bar__mark ws-theme-dark"
        :src="markOnDark"
        alt=""
        width="32"
        height="32"
      />
      <img
        class="tab-bar__mark ws-theme-light"
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
      <!-- On a project's page the ghost links to the handle's site. A cut for each theme, too. -->
      <a href="https://whatsaaaa.github.io/" aria-label="A whatsaaaa project">
        <img
          class="ws-theme-dark"
          :src="ghostOnDark"
          alt=""
          width="20"
          height="24"
        />
        <img
          class="ws-theme-light"
          :src="ghostOnLight"
          alt=""
          width="20"
          height="24"
        />
      </a>
    </div>
  </header>
</template>
