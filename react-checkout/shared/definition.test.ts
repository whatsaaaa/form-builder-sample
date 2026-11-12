import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { builders } from './builder'
import { checkoutDefinition } from './definition'
import { locales, lookup, messageKeys } from './i18n'

/** Every text of the definition that a person reads: labels, hints, messages and option labels. */
function textsOf(value: unknown, key = ''): string[] {
  if (typeof value === 'string') {
    const isText =
      ['label', 'description', 'placeholder', 'message', 'text'].includes(
        key,
      ) || ['itemLabel', 'addLabel'].includes(key)
    return isText ? [value] : []
  }
  if (Array.isArray(value)) return value.flatMap((item) => textsOf(item, key))
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([name, child]) =>
      textsOf(child, name),
    )
  }
  return []
}

describe('the checkout definition', () => {
  it('has no issues', () => {
    expect(builders.en.validate(checkoutDefinition)).toEqual({
      success: true,
      issues: [],
    })
  })

  it('only holds texts that every language has', () => {
    const texts = textsOf(checkoutDefinition)
    expect(texts.length).toBeGreaterThan(30)
    for (const locale of locales) {
      const missing = texts.filter((key) => lookup(locale, key) === undefined)
      expect(missing, `keys missing in ${locale}`).toEqual([])
    }
  })

  it('starts with its defaults', () => {
    expect(builders.en.getInitialInput(checkoutDefinition)).toEqual({
      lines: [],
      shipping: {},
      paymentMethod: 'card',
    })
  })
})

describe('the languages', () => {
  it('have the same keys', () => {
    expect([...messageKeys.de].sort()).toEqual([...messageKeys.en].sort())
  })

  it('give the same schema its messages, each in its own words', () => {
    const input = {
      email: 'jelena',
      lines: [],
      delivery: 'pickup',
      paymentMethod: 'card',
    }
    const messages = Object.fromEntries(
      locales.map((locale) => {
        const result = v.safeParse(
          builders[locale].build(checkoutDefinition),
          input,
        )
        return [locale, result.success ? {} : v.flatten(result.issues).nested]
      }),
    )
    expect(messages).toEqual({
      en: {
        email: ['Enter a valid email address'],
        lines: ['Add at least one item'],
        acceptTerms: ['Please accept the terms of sale'],
      },
      de: {
        email: ['Geben Sie eine gültige E-Mail-Adresse ein'],
        lines: ['Fügen Sie mindestens einen Artikel hinzu'],
        acceptTerms: ['Bitte akzeptieren Sie die Verkaufsbedingungen'],
      },
    })
  })
})
