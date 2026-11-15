import type { OrderTotal } from '../../shared/catalog'
import { useLocale } from '../locale/context'

/** What the order costs: a line per item, the delivery, and the total. */
export function OrderSummary({ total }: { total: OrderTotal }) {
  const { t, money } = useLocale()
  return (
    <dl className="ws-pairs ws-pairs--amounts" data-testid="summary">
      {total.lines.length === 0 && (
        <div>
          <dt>{t('summary.empty')}</dt>
        </div>
      )}
      {total.lines.map((line, index) => (
        <div key={index}>
          <dt>
            {line.quantity} x {t(line.label)}
          </dt>
          <dd>{money(line.amount)}</dd>
        </div>
      ))}
      {total.delivery && (
        <div>
          <dt>{t('summary.delivery')}</dt>
          <dd>{money(total.delivery.amount)}</dd>
        </div>
      )}
      <div className="ws-pairs__total">
        <dt>{t('summary.total')}</dt>
        <dd>{money(total.total)}</dd>
      </div>
    </dl>
  )
}
