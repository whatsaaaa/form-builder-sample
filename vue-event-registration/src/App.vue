<script setup lang="ts">
import type { JsonForm } from '@whatsaaaa/form-builder-schema'
import { ref } from 'vue'
import json from './registration/definition.json'
import { InvalidDefinitionError, loadDefinition } from './registration/builder'
import RegistrationForm from './registration/RegistrationForm.vue'
import type { Registration } from './registration/types'
import NoticePanel from './ui/NoticePanel.vue'
import PageShell from './ui/PageShell.vue'

// The definition is data: it is checked before it is rendered, as one from a database would be.
let definition: JsonForm | undefined
let problems: readonly string[] = []
try {
  definition = loadDefinition(json)
} catch (error) {
  if (!(error instanceof InvalidDefinitionError)) throw error
  problems = error.problems
}

const registration = ref<Registration>()
// A new key gives a new form, since `useJsonForm` reads its definition once.
const formKey = ref(0)

function startOver() {
  registration.value = undefined
  formKey.value += 1
}
</script>

<template>
  <PageShell
    title="Harbour Conf 2027"
    lead="May 10 to 12, 2027. Register in a few steps."
  >
    <NoticePanel
      v-if="!definition"
      tone="error"
      title="This form can't be shown"
    >
      <ul>
        <li v-for="problem in problems" :key="problem">{{ problem }}</li>
      </ul>
    </NoticePanel>
    <NoticePanel v-else-if="registration" title="You're registered">
      <p>
        Thank you, {{ registration.firstName }}. Your ticket is on its way to
        {{ registration.email }}.
      </p>
      <p>This is what the form submitted:</p>
      <pre class="notice__code" data-testid="output">{{
        JSON.stringify(registration, null, 2)
      }}</pre>
      <button type="button" class="button" @click="startOver">
        Register someone else
      </button>
    </NoticePanel>
    <RegistrationForm
      v-else
      :key="formKey"
      :definition="definition"
      @submitted="registration = $event"
    />
  </PageShell>
</template>
