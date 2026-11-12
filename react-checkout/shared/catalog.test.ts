import { describe, expect, it } from 'vitest'
import { totalOf } from './catalog'

describe('totalOf', () => {
  it('adds up the lines and the delivery, in cents', () => {
    const total = totalOf(
      [
        { product: 'mug', quantity: 2 },
        { product: 'notebook', quantity: 1 },
      ],
      'express',
    )
    expect(total.lines.map((line) => line.amount)).toEqual([2800, 950])
    expect(total.delivery?.amount).toBe(990)
    expect(total.total).toBe(4740)
  })

  it('leaves out lines that are not filled in yet', () => {
    const total = totalOf(
      [
        { product: 'mug' },
        { quantity: 3 },
        { product: 'tote', quantity: 0 },
        { product: 'tote', quantity: 1.5 },
        { product: 'poster', quantity: 1 },
      ],
      undefined,
    )
    expect(total.lines).toHaveLength(1)
    expect(total.delivery).toBeUndefined()
    expect(total.total).toBe(2400)
  })

  it('is zero for an empty order', () => {
    expect(totalOf(undefined, undefined).total).toBe(0)
  })
})
