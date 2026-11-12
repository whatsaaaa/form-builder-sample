import {
  DefinitionError,
  formatPath,
  type JsonForm,
} from '@whatsaaaa/form-builder-schema'
import type {
  CheckoutFormResponse,
  OrderAccepted,
  OrderRejected,
  OrderRequest,
} from '../../shared/api'
import { builders } from '../../shared/builder'
import type { Locale } from '../../shared/i18n'

export interface LoadedCheckout {
  id: string
  definition: JsonForm
}

/**
 * Fetches the checkout form from the server. The definition comes from outside this code, so it
 * is checked before it is rendered: a broken one fails here, with every problem in the console.
 */
export async function loadCheckout(
  signal?: AbortSignal,
): Promise<LoadedCheckout> {
  const response = await fetch('/api/checkout', { signal })
  if (!response.ok) {
    throw new Error(`GET /api/checkout answered ${String(response.status)}`)
  }
  const { id, definition } = (await response.json()) as CheckoutFormResponse
  const result = builders.en.validate(definition)
  if (!result.success) {
    console.error(
      result.issues
        .map((issue) => `${formatPath(issue.path)}: ${issue.message}`)
        .join('\n'),
    )
    throw new DefinitionError(result.issues)
  }
  return { id, definition }
}

export type PlaceOrderResult =
  | { accepted: true; order: OrderAccepted }
  | { accepted: false; rejection: OrderRejected }

/**
 * Sends the form's input to the server, which validates it again with the schema of the same
 * definition, and answers in the user's language. Throws when the server can't be reached or
 * answers with something else than an order or a rejection.
 */
export async function placeOrder(
  locale: Locale,
  definitionId: string,
  input: unknown,
): Promise<PlaceOrderResult> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': locale,
    },
    body: JSON.stringify({ definitionId, input } satisfies OrderRequest),
  })
  if (response.status === 201) {
    return { accepted: true, order: (await response.json()) as OrderAccepted }
  }
  if ([400, 409, 422].includes(response.status)) {
    return {
      accepted: false,
      rejection: (await response.json()) as OrderRejected,
    }
  }
  throw new Error(`POST /api/orders answered ${String(response.status)}`)
}
