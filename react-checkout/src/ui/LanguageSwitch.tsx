import { localeNames, locales, type Locale } from '../../shared/i18n'
import { useLocale } from '../locale/context'

/** The languages of the shop, side by side. The one on show is pressed. */
export function LanguageSwitch({
  onChange,
}: {
  onChange: (locale: Locale) => void
}) {
  const { locale, t } = useLocale()
  return (
    <div
      className="language ws-segmented"
      role="group"
      aria-label={t('app.language')}
    >
      {locales.map((each) => (
        <button
          key={each}
          type="button"
          lang={each}
          aria-pressed={each === locale}
          onClick={() => {
            onChange(each)
          }}
        >
          {localeNames[each]}
        </button>
      ))}
    </div>
  )
}
