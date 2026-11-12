import { focus, Form, getInput, reset, setErrors } from '@formisch/react'
import type { JsonForm } from '@whatsaaaa/form-builder-schema'
import { JsonFields, useJsonForm } from '@whatsaaaa/form-builder-react'
import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
} from 'react'
import type { OrderAccepted, OrderIssue } from '../../shared/api'
import { builders } from '../../shared/builder'
import { totalOf } from '../../shared/catalog'
import type { Checkout } from '../../shared/types'
import { useLocale } from '../locale/context'
import { Button } from '../ui/Button'
import { components } from '../ui/fields'
import { layoutComponents } from '../ui/layout'
import { Notice } from '../ui/Notice'
import { OrderSummary } from '../ui/OrderSummary'
import { placeOrder } from './api'

/** What the parent can ask of the form: its input now, to carry it over to another language. */
export interface CheckoutFormHandle {
  input: () => unknown
}

interface CheckoutFormProps {
  definition: JsonForm
  definitionId: string
  /** What the form starts with, instead of the defaults of the definition. */
  initialInput?: unknown
  onPlaced: (order: OrderAccepted) => void
  ref?: Ref<CheckoutFormHandle>
}

/**
 * The checkout form of one language. `useJsonForm` reads the definition and the builder on the
 * first render, so the parent gives this component a new `key` for another language.
 */
export function CheckoutForm({
  definition,
  definitionId,
  initialInput,
  onPlaced,
  ref,
}: CheckoutFormProps) {
  const { locale, t } = useLocale()
  const jsonForm = useJsonForm<Checkout>(definition, {
    builder: builders[locale],
    components,
    layoutComponents,
  })
  const { form } = jsonForm
  const [failure, setFailure] = useState<string>()

  // `useJsonForm` takes no initial input, so the input of the form before is set right after
  // the first render, before the browser paints. It is read once, when the form is made: what
  // the form holds after that is the user's own.
  const firstInput = useRef(initialInput)
  useLayoutEffect(() => {
    if (firstInput.current !== undefined) {
      reset(form, { initialInput: firstInput.current as never })
    }
  }, [form])

  useImperativeHandle(ref, () => ({ input: () => getInput(form) }), [form])

  const input = getInput(form)
  const total = totalOf(input.lines, input.delivery)

  /** Shows the server's messages on the fields they belong to, and focuses the first one. */
  function showIssues(issues: readonly OrderIssue[]) {
    const byField = new Map<
      string,
      { path: OrderIssue['path']; messages: string[] }
    >()
    for (const issue of issues) {
      const key = JSON.stringify(issue.path)
      const entry = byField.get(key) ?? { path: issue.path, messages: [] }
      entry.messages.push(issue.message)
      byField.set(key, entry)
    }
    for (const { path, messages } of byField.values()) {
      // The paths come from the server at runtime, so TypeScript can't check them. The cast is
      // on the whole config: `path: path as never` alone turns the config type into `never`.
      setErrors(form, { path, errors: messages } as never)
    }
    const first = issues.find((issue) => issue.path.length > 0)
    if (first) focus(form, { path: first.path as never })
  }

  // Formisch has validated the form in the browser by now. The server validates it again: send
  // it the form's input, not the output, so its schema parses what the browser's schema parsed.
  async function submit() {
    setFailure(undefined)
    try {
      const result = await placeOrder(locale, definitionId, getInput(form))
      if (result.accepted) {
        onPlaced(result.order)
        return
      }
      showIssues(result.rejection.issues)
      setFailure(result.rejection.message)
    } catch {
      setFailure(t('checkout.failed'))
    }
  }

  return (
    <Form of={form} onSubmit={submit}>
      <JsonFields
        of={jsonForm}
        slots={{
          summary: <OrderSummary total={total} />,
          submit: (
            <div className="stack stack--tight">
              {failure && <Notice tone="error">{failure}</Notice>}
              <Button
                type="submit"
                variant="primary"
                wide
                disabled={form.isSubmitting}
              >
                {form.isSubmitting
                  ? t('checkout.submitting')
                  : t('checkout.submit')}
              </Button>
            </div>
          ),
        }}
      />
    </Form>
  )
}
