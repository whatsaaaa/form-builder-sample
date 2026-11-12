import '@valibot/i18n/de'
import { affects } from '@whatsaaaa/form-builder-affects'
import { createSchemaBuilder } from '@whatsaaaa/form-builder-schema'
import { locales, lookup, type Locale } from './i18n'

/**
 * A builder that reports its messages in one language. The browser and the server make theirs
 * with this one function, so both have the same extensions and the same messages.
 */
function createCheckoutBuilder(locale: Locale) {
  return createSchemaBuilder({
    extensions: [affects()],
    // The key of the required message of every field without its own.
    messages: { required: 'form.required' },
    // The definition holds keys. A text that is no key is kept as written.
    resolveMessage: (key) => lookup(locale, key),
  })
}

/** One builder per language, made once: a builder resolves its messages when it builds. */
export const builders = Object.fromEntries(
  locales.map((locale) => [locale, createCheckoutBuilder(locale)]),
) as Record<Locale, ReturnType<typeof createCheckoutBuilder>>
