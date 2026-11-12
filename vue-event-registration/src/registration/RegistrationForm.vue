<script setup lang="ts">
import { Form, getInput } from '@formisch/vue'
import type { JsonForm } from '@whatsaaaa/form-builder-schema'
import { JsonFields, useJsonForm } from '@whatsaaaa/form-builder-vue'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { components } from '../ui/fields'
import FormActions from '../ui/FormActions.vue'
import FormFrame from '../ui/FormFrame.vue'
import { layoutComponents } from '../ui/layout'
import StepIndicator from '../ui/StepIndicator.vue'
import StepPanel from '../ui/StepPanel.vue'
import SummaryList from '../ui/SummaryList.vue'
import { builder } from './builder'
import { summarize } from './summary'
import type { Registration } from './types'

const { definition } = defineProps<{ definition: JsonForm }>()
const emit = defineEmits<{ submitted: [registration: Registration] }>()

const jsonForm = useJsonForm<Registration>(definition, {
  builder,
  components,
  layoutComponents,
})

const stepLabels = computed(() =>
  jsonForm.steps.list.map((step) => step.step.label ?? ''),
)

// A new step starts at its title, so keyboard and screen reader users land on what changed.
const stepPanel = useTemplateRef('stepPanel')
watch(
  () => jsonForm.steps.current,
  async () => {
    await nextTick()
    stepPanel.value?.focusTitle()
  },
)

// The review on the last step: every step before it, as text.
const summary = computed(() =>
  summarize(
    jsonForm.steps.list.slice(0, jsonForm.steps.index),
    jsonForm.visibility,
    getInput(jsonForm.form),
  ),
)
</script>

<template>
  <Form :of="jsonForm.form" @submit="(output) => emit('submitted', output)">
    <FormFrame>
      <StepIndicator
        :steps="stepLabels"
        :current="jsonForm.steps.index"
        @go-to="jsonForm.steps.goTo($event)"
      />
      <StepPanel
        ref="stepPanel"
        :title="jsonForm.steps.current.step.label"
        :lead="jsonForm.steps.current.step.description"
      >
        <JsonFields :of="jsonForm">
          <template #summary>
            <SummaryList :sections="summary" />
          </template>
        </JsonFields>
      </StepPanel>
      <FormActions
        :is-first="jsonForm.steps.isFirst"
        :is-last="jsonForm.steps.isLast"
        submit-label="Register"
        @back="jsonForm.steps.back()"
      />
    </FormFrame>
  </Form>
</template>
