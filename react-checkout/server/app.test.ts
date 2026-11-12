import { describe, expect, it } from 'vitest'
import type {
  CheckoutFormResponse,
  OrderAccepted,
  OrderRejected,
} from '../shared/api'
import { builders } from '../shared/builder'
import { checkoutDefinitionId } from '../shared/definition'
import { createApp } from './app'

const app = createApp()

/** An order that passes: one item, shipped, paid by card. */
const valid = {
  email: 'jana@example.com',
  lines: [{ product: 'mug', quantity: 2 }],
  delivery: 'standard',
  shipping: {
    fullName: 'Jana Kovač',
    street: 'Knez Mihailova 1',
    zip: '11000',
    city: 'Belgrade',
    country: 'RS',
  },
  paymentMethod: 'card',
  acceptTerms: true,
}

async function placeOrder(input: unknown, language = 'en') {
  const response = await app.request('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': language,
    },
    body: JSON.stringify({ definitionId: checkoutDefinitionId, input }),
  })
  return { status: response.status, body: (await response.json()) as unknown }
}

/** The messages of a rejected order, by the dot path of each field. */
function messagesOf(body: unknown) {
  return Object.fromEntries(
    (body as OrderRejected).issues.map((issue) => [
      issue.path.join('.'),
      issue.message,
    ]),
  )
}

describe('GET /api/checkout', () => {
  it('serves a definition that has no issues', async () => {
    const response = await app.request('/api/checkout')
    const { id, definition } = (await response.json()) as CheckoutFormResponse
    expect(id).toBe(checkoutDefinitionId)
    expect(builders.en.validate(definition)).toEqual({
      success: true,
      issues: [],
    })
  })
})

describe('POST /api/orders', () => {
  it('accepts a valid order and works out its total', async () => {
    const { status, body } = await placeOrder({
      ...valid,
      coupon: ' spring ',
      note: '',
    })
    expect(status).toBe(201)
    const accepted = body as OrderAccepted
    expect(accepted.orderId).toMatch(/^HC-\d{5}$/)
    // Two mugs at 14.00 and standard delivery at 4.90, in cents.
    expect(accepted.total).toBe(3290)
    // The output of the schema: trimmed, upper-cased, and without what was left empty.
    expect(accepted.order).toEqual({ ...valid, coupon: 'SPRING' })
  })

  it('rejects an order the browser would never send, in the language asked for', async () => {
    const tampered = {
      ...valid,
      email: 'jana',
      lines: [{ product: 'mug', quantity: 'many' }, { quantity: 11 }],
      shipping: { ...valid.shipping, zip: 'ABC' },
      acceptTerms: false,
    }

    const english = await placeOrder(tampered)
    expect(english.status).toBe(422)
    expect(english.body).toMatchObject({ code: 'invalid_order' })
    expect(messagesOf(english.body)).toEqual({
      email: 'Enter a valid email address',
      'lines.0.quantity': 'Invalid type: Expected number but received "many"',
      'lines.1.product': 'Choose a product',
      'lines.1.quantity': 'Order up to ten of one product',
      'shipping.zip': 'Use 4 or 5 digits',
      acceptTerms: 'Please accept the terms of sale',
    })

    const german = await placeOrder(tampered, 'de-AT,de;q=0.9,en;q=0.8')
    expect(german.status).toBe(422)
    expect(messagesOf(german.body)).toEqual({
      email: 'Geben Sie eine gültige E-Mail-Adresse ein',
      'lines.0.quantity':
        'Ungültiger Typ: number erwartet aber "many" erhalten',
      'lines.1.product': 'Wählen Sie ein Produkt',
      'lines.1.quantity': 'Bestellen Sie höchstens zehn Stück eines Produkts',
      'shipping.zip': 'Verwenden Sie 4 oder 5 Ziffern',
      acceptTerms: 'Bitte akzeptieren Sie die Verkaufsbedingungen',
    })
  })

  it('reports a required field whose key is missing with its own message', async () => {
    const { status, body } = await placeOrder({})
    expect(status).toBe(422)
    expect(messagesOf(body)).toMatchObject({
      email: 'Enter your email',
      lines: 'Add at least one item',
      delivery: 'Choose how to get your order',
      paymentMethod: 'Choose how to pay',
      acceptTerms: 'Please accept the terms of sale',
    })
  })

  it('applies the conditions of the definition', async () => {
    // Picked up: no address is asked for, and one that is sent is dropped.
    const pickup = await placeOrder({ ...valid, delivery: 'pickup' })
    expect(pickup.status).toBe(201)
    expect((pickup.body as OrderAccepted).order.shipping).toEqual({})
    expect((pickup.body as OrderAccepted).total).toBe(2800)

    // Paid by invoice: the company name is required.
    const invoice = await placeOrder({ ...valid, paymentMethod: 'invoice' })
    expect(invoice.status).toBe(422)
    expect(messagesOf(invoice.body)).toEqual({
      company: 'Enter the company name',
    })
  })

  it('drops keys the definition does not know', async () => {
    const { status, body } = await placeOrder({
      ...valid,
      total: 1,
      role: 'admin',
    })
    expect(status).toBe(201)
    expect((body as OrderAccepted).order).toEqual(valid)
  })

  it('refuses an order made with another version of the definition', async () => {
    const response = await app.request('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'de' },
      body: JSON.stringify({ definitionId: 'checkout-2026-01', input: valid }),
    })
    expect(response.status).toBe(409)
    expect(await response.json()).toMatchObject({
      code: 'outdated_definition',
      message:
        'Die Kasse hat sich geändert. Laden Sie die Seite neu und versuchen Sie es noch einmal.',
    })
  })

  it('refuses a body that is no order request', async () => {
    const response = await app.request('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ code: 'invalid_request' })
  })
})
