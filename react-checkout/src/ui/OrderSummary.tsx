import type { OrderTotal } from '../../shared/catalog'
import { useLocale } from '../locale/context'

/** What the order costs: a line per item, the delivery, and the total. */
export function OrderSummary({ total }: { total: OrderTotal }) {
  const { t, money } = useLocale()
  return (
    <dl className="summary" data-testid="summary">
      {total.lines.length === 0 && (
        <div className="summary__row summary__row--empty">
          <dt className="summary__term">{t('summary.empty')}</dt>
        </div>
      )}
      {total.lines.map((line, index) => (
        <div key={index} className="summary__row">
          <dt className="summary__term">
            {line.quantity} x {t(line.label)}
          </dt>
          <dd className="summary__value">{money(line.amount)}</dd>
        </div>
      ))}
      {total.delivery && (
        <div className="summary__row">
          <dt className="summary__term">{t('summary.delivery')}</dt>
          <dd className="summary__value">{money(total.delivery.amount)}</dd>
        </div>
      )}
      <div className="summary__row summary__row--total">
        <dt className="summary__term">{t('summary.total')}</dt>
        <dd className="summary__value">{money(total.total)}</dd>
      </div>
    </dl>
  )
}
