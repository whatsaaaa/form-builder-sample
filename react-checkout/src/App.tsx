import { useEffect, useRef, useState } from 'react'
import * as v from 'valibot'
import type { OrderAccepted } from '../shared/api'
import { isLocale, locales, type Locale } from '../shared/i18n'
import { loadCheckout, type LoadedCheckout } from './checkout/api'
import { CheckoutForm, type CheckoutFormHandle } from './checkout/CheckoutForm'
import { useLocale } from './locale/context'
import { LocaleProvider } from './locale/LocaleProvider'
import { Button } from './ui/Button'
import { CodeBlock } from './ui/CodeBlock'
import { Notice } from './ui/Notice'
import { PageShell } from './ui/PageShell'
import { StatusMessage } from './ui/StatusMessage'

type Loading =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'ready'; checkout: LoadedCheckout }

/** The language of the browser when the shop speaks it, or else English. */
function browserLocale(): Locale {
  const language = navigator.language.slice(0, 2).toLowerCase()
  return isLocale(language) ? language : locales[0]
}

/** The language of Valibot's own messages, for rules without a message of their own. */
function useValibotLanguage(locale: Locale) {
  useEffect(() => {
    v.setGlobalConfig({ lang: locale })
    document.documentElement.lang = locale
  }, [locale])
}

export function App() {
  const [locale, setLocale] = useState(browserLocale)
  const [loading, setLoading] = useState<Loading>({ status: 'loading' })
  const [placed, setPlaced] = useState<OrderAccepted>()
  // Counts the orders placed, so each one starts with an empty form.
  const [round, setRound] = useState(0)
  useValibotLanguage(locale)

  // A form is made for one language. Before another one takes its place, its input is kept, so
  // the new form starts with what the user typed.
  const form = useRef<CheckoutFormHandle>(null)
  const [draft, setDraft] = useState<unknown>()

  function changeLocale(next: Locale) {
    if (next === locale) return
    setDraft(form.current?.input())
    setLocale(next)
  }

  // Counts the tries, so "Try again" loads the checkout once more.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    loadCheckout(controller.signal).then(
      (checkout) => {
        setLoading({ status: 'ready', checkout })
      },
      () => {
        if (!controller.signal.aborted) setLoading({ status: 'failed' })
      },
    )
    return () => {
      controller.abort()
    }
  }, [attempt])

  return (
    <LocaleProvider locale={locale}>
      <PageShell onLocaleChange={changeLocale}>
        {loading.status === 'loading' && <Status messageKey="app.loading" />}
        {loading.status === 'failed' && (
          <LoadFailed
            onRetry={() => {
              setLoading({ status: 'loading' })
              setAttempt((count) => count + 1)
            }}
          />
        )}
        {loading.status === 'ready' &&
          (placed ? (
            <OrderPlaced
              order={placed}
              onAgain={() => {
                setPlaced(undefined)
                setDraft(undefined)
                setRound((count) => count + 1)
              }}
            />
          ) : (
            <CheckoutForm
              // A new form per language: a builder resolves its messages when it builds.
              key={`${locale}-${String(round)}`}
              ref={form}
              initialInput={draft}
              definition={loading.checkout.definition}
              definitionId={loading.checkout.id}
              onPlaced={setPlaced}
            />
          ))}
      </PageShell>
    </LocaleProvider>
  )
}

function Status({ messageKey }: { messageKey: string }) {
  const { t } = useLocale()
  return <StatusMessage>{t(messageKey)}</StatusMessage>
}

function LoadFailed({ onRetry }: { onRetry: () => void }) {
  const { t } = useLocale()
  return (
    <Notice tone="error" title={t('app.loadFailed')}>
      <p>{t('app.loadFailed.hint')}</p>
      <Button onClick={onRetry}>{t('app.retry')}</Button>
    </Notice>
  )
}

function OrderPlaced({
  order,
  onAgain,
}: {
  order: OrderAccepted
  onAgain: () => void
}) {
  const { t, money } = useLocale()
  return (
    <Notice tone="success" title={t('done.title')}>
      <p>
        {t('done.lead', { orderId: order.orderId, email: order.order.email })}
      </p>
      <p>
        {t('done.total')}: <strong>{money(order.total)}</strong>
      </p>
      <CodeBlock
        code={JSON.stringify(order.order, null, 2)}
        file="order.json"
        data-testid="order"
      />
      <Button onClick={onAgain}>{t('done.again')}</Button>
    </Notice>
  )
}
