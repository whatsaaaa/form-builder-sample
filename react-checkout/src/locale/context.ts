import { createContext, useContext } from 'react'
import type { Locale } from '../../shared/i18n'

export interface LocaleValue {
  locale: Locale
  /** The text of a key in the current language. A text that is no key stays as it is. */
  t: (key: string | undefined, values?: Record<string, string>) => string
  /** An amount in euro cents, the way the current language writes money. */
  money: (cents: number) => string
}

export const LocaleContext = createContext<LocaleValue | undefined>(undefined)

/**
 * The current language. The definition holds keys for labels and other text, and the components
 * translate them with `t`, as the schema builder does for messages.
 */
export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext)
  if (!value) throw new Error('useLocale needs a LocaleProvider around it')
  return value
}
