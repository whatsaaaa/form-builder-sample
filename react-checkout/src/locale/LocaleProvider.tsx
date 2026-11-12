import { useMemo, type ReactNode } from 'react'
import { formatMoney, translate, type Locale } from '../../shared/i18n'
import { LocaleContext, type LocaleValue } from './context'

interface LocaleProviderProps {
  locale: Locale
  children: ReactNode
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const value = useMemo<LocaleValue>(
    () => ({
      locale,
      t: (key, values) => (key ? translate(locale, key, values) : ''),
      money: (cents) => formatMoney(locale, cents),
    }),
    [locale],
  )
  return <LocaleContext value={value}>{children}</LocaleContext>
}
