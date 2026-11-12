<script setup lang="ts">
import { Form, getInput } from '@formisch/vue'
import type { JsonForm } from '@whatsaaaa/form-builder-schema'
import { JsonFields, useJsonForm } from '@whatsaaaa/form-builder-vue'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { components } from '../ui/fields'
import FormActions from '../ui/FormActions.vue'
import { layoutComponents } from '../ui/layout'
import StepIndicator from '../ui/StepIndicator.vue'
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
const stepTitle = useTemplateRef('stepTitle')
watch(
  () => jsonForm.steps.current,
  async () => {
    await nextTick()
    stepTitle.value?.focus()
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
  <Form
    :of="jsonForm.form"
    class="form"
    @submit="(output) => emit('submitted', output)"
  >
    <StepIndicator
      :steps="stepLabels"
      :current="jsonForm.steps.index"
      @go-to="jsonForm.steps.goTo($event)"
    />
    <section class="form__step" aria-labelledby="step-title">
      <h2
        id="step-title"
        ref="stepTitle"
        class="form__step-title"
        tabindex="-1"
      >
        {{ jsonForm.steps.current.step.label }}
      </h2>
      <p v-if="jsonForm.steps.current.step.description" class="form__step-lead">
        {{ jsonForm.steps.current.step.description }}
      </p>
      <div class="stack">
        <JsonFields :of="jsonForm">
          <template #summary>
            <SummaryList :sections="summary" />
          </template>
        </JsonFields>
      </div>
    </section>
    <FormActions
      :is-first="jsonForm.steps.isFirst"
      :is-last="jsonForm.steps.isLast"
      submit-label="Register"
      @back="jsonForm.steps.back()"
    />
  </Form>
</template>
