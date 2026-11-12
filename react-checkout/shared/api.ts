import type { JsonForm } from '@whatsaaaa/form-builder-schema'
import type { Checkout } from './types'

/** `GET /api/checkout`: the form to render, and the id to send back with an order. */
export interface CheckoutFormResponse {
  id: string
  definition: JsonForm
}

/** `POST /api/orders`: the form's input, and the id of the definition it was filled in with. */
export interface OrderRequest {
  definitionId: string
  input: unknown
}

/** 201: the order as the server validated it, and what it costs in euro cents. */
export interface OrderAccepted {
  orderId: string
  order: Checkout
  total: number
}

/** One problem with an order: the Formisch path of its field, and a message in the user's language. */
export interface OrderIssue {
  path: (string | number)[]
  message: string
}

/** 422: the order failed the schema of the definition. 400 and 409: it wasn't an order at all. */
export interface OrderRejected {
  code: 'invalid_order' | 'invalid_request' | 'outdated_definition'
  message: string
  issues: OrderIssue[]
}
