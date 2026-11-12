import type { ReactNode } from 'react'
import { localeNames, locales, type Locale } from '../../shared/i18n'
import { useLocale } from '../locale/context'

interface PageShellProps {
  onLocaleChange: (locale: Locale) => void
  children: ReactNode
}

/** The page around the checkout: its title, and the switch between languages. */
export function PageShell({ onLocaleChange, children }: PageShellProps) {
  const { locale, t } = useLocale()
  return (
    <main className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">{t('app.title')}</h1>
          <p className="page__lead">{t('app.lead')}</p>
        </div>
        <div className="language" role="group" aria-label={t('app.language')}>
          {locales.map((each) => (
            <button
              key={each}
              type="button"
              className="language__button"
              lang={each}
              aria-pressed={each === locale}
              onClick={() => {
                onLocaleChange(each)
              }}
            >
              {localeNames[each]}
            </button>
          ))}
        </div>
      </header>
      {children}
    </main>
  )
}
