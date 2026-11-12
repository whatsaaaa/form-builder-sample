import type { ArrayFieldProps } from '@whatsaaaa/form-builder-react'
import { useLocale } from '../../locale/context'
import { uiHint } from './hints'

export function ListRepeater({
  field,
  items,
  errors,
  add,
  remove,
  children,
}: ArrayFieldProps) {
  const { t } = useLocale()
  // What to call one item, from the definition's `ui`: "Item 1".
  const itemLabel = t(uiHint(field, 'itemLabel') ?? field.label)
  // The list's own `maxLength` rule, if it has one: no Add button once it is full.
  const max = field.rules?.find((rule) => rule.rule === 'maxLength')?.value
  const isFull = typeof max === 'number' && items.length >= max
  return (
    <fieldset className="group">
      {field.label && (
        <legend className="group__label">{t(field.label)}</legend>
      )}
      {field.description && (
        <p className="group__hint">{t(field.description)}</p>
      )}
      <div className="stack">
        {items.length === 0 && <p className="list__empty">{t('form.empty')}</p>}
        {items.map((item, index) => (
          <section
            key={item}
            className="list__item"
            aria-label={`${itemLabel} ${String(index + 1)}`}
          >
            <header className="list__item-header">
              <h3 className="list__item-title">
                {itemLabel} {index + 1}
              </h3>
              <button
                type="button"
                className="button button--quiet"
                aria-label={`${t('form.remove')}: ${itemLabel} ${String(index + 1)}`}
                onClick={() => {
                  remove(index)
                }}
              >
                {t('form.remove')}
              </button>
            </header>
            <div className="stack">{children(index)}</div>
          </section>
        ))}
        {errors && <p className="field__error">{errors[0]}</p>}
        {!isFull && (
          <div>
            <button
              type="button"
              className="button"
              onClick={() => {
                add()
              }}
            >
              {t(uiHint(field, 'addLabel') ?? field.label)}
            </button>
          </div>
        )}
      </div>
    </fieldset>
  )
}
