/** What the shop sells and how it delivers. Prices are in euro cents, so sums stay whole numbers. */
export const currency = 'EUR'

export const products = [
  { id: 'mug', label: 'catalog.mug', price: 1400 },
  { id: 'tote', label: 'catalog.tote', price: 1800 },
  { id: 'notebook', label: 'catalog.notebook', price: 950 },
  { id: 'poster', label: 'catalog.poster', price: 2400 },
] as const

export const deliveries = [
  { id: 'standard', label: 'checkout.delivery.standard', price: 490 },
  { id: 'express', label: 'checkout.delivery.express', price: 990 },
  { id: 'pickup', label: 'checkout.delivery.pickup', price: 0 },
] as const

export type ProductId = (typeof products)[number]['id']
export type DeliveryId = (typeof deliveries)[number]['id']

export interface OrderLine {
  product: ProductId
  quantity: number
}

export interface OrderTotal {
  lines: {
    product: ProductId
    label: string
    quantity: number
    amount: number
  }[]
  delivery: { id: DeliveryId; label: string; amount: number } | undefined
  total: number
}

/**
 * The cost of an order. The browser shows it while the user fills in the form, and the server
 * works it out again from the validated order, so the two never disagree. Lines that are not
 * filled in yet are left out.
 */
export function totalOf(
  lines: readonly Partial<OrderLine>[] | undefined,
  deliveryId: DeliveryId | undefined,
): OrderTotal {
  const priced = (lines ?? []).flatMap((line) => {
    const product = products.find((each) => each.id === line.product)
    const quantity = line.quantity
    if (
      !product ||
      typeof quantity !== 'number' ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return []
    }
    return [
      {
        product: product.id,
        label: product.label,
        quantity,
        amount: product.price * quantity,
      },
    ]
  })
  const delivery = deliveries.find((each) => each.id === deliveryId)
  return {
    lines: priced,
    delivery: delivery && {
      id: delivery.id,
      label: delivery.label,
      amount: delivery.price,
    },
    total:
      priced.reduce((sum, line) => sum + line.amount, 0) +
      (delivery?.price ?? 0),
  }
}
