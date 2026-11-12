import type { DeliveryId, OrderLine } from './catalog'

/**
 * The value of the checkout form. Nothing checks it against `definition.ts`, so keep the two in
 * step. A field that conditions can hide is optional: it submits nothing while it is hidden.
 */
export interface Checkout {
  email: string
  lines: OrderLine[]
  delivery: DeliveryId
  shipping: {
    fullName?: string
    street?: string
    zip?: string
    city?: string
    country?: 'AT' | 'HR' | 'DE'
  }
  paymentMethod: 'card' | 'invoice'
  company?: string
  coupon?: string
  note?: string
  acceptTerms: boolean
}
