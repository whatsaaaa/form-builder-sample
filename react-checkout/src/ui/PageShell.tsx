import type { ReactNode } from 'react'
import type { Locale } from '../../shared/i18n'
import { useLocale } from '../locale/context'
import { LanguageSwitch } from './LanguageSwitch'
import { StatusLine } from './StatusLine'
import { TabBar } from './TabBar'

interface PageShellProps {
  onLocaleChange: (locale: Locale) => void
  children: ReactNode
}

/**
 * The page around the checkout, in the design system's terminal frame: a window with a tab bar
 * on top and a status line, and in it the title and the switch between languages.
 */
export function PageShell({ onLocaleChange, children }: PageShellProps) {
  const { t } = useLocale()
  return (
    <div className="page ws-term">
      <TabBar />
      <main className="page__main">
        <div className="page__content">
          <header className="page__header">
            <h1 className="page__title">{t('app.title')}</h1>
            <p className="page__lead">{t('app.lead')}</p>
            <LanguageSwitch onChange={onLocaleChange} />
          </header>
          {children}
        </div>
      </main>
      <StatusLine />
    </div>
  )
}
