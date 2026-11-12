import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import * as v from 'valibot'
import type {
  CheckoutFormResponse,
  OrderAccepted,
  OrderRejected,
} from '../shared/api'
import { builders } from '../shared/builder'
import { totalOf } from '../shared/catalog'
import { checkoutDefinition, checkoutDefinitionId } from '../shared/definition'
import { isLocale, locales, translate, type Locale } from '../shared/i18n'
import type { Checkout } from '../shared/types'

// Built once per language, from the definition the browser renders and with the browser's
// builder options. Each schema reports its messages in its language.
const schemas = Object.fromEntries(
  locales.map((locale) => [
    locale,
    builders[locale].build<Checkout>(checkoutDefinition),
  ]),
) as Record<Locale, ReturnType<typeof builders.en.build<Checkout>>>

const OrderRequestSchema = v.object({
  definitionId: v.string(),
  input: v.unknown(),
})

/** The first language of an `Accept-Language` header that the shop speaks, or English. */
function localeOf(header: string | undefined): Locale {
  for (const part of (header ?? '').split(',')) {
    const language = part.split(';')[0]?.trim().slice(0, 2).toLowerCase()
    if (isLocale(language)) return language
  }
  return locales[0]
}

let orderCount = 0

export interface AppOptions {
  /** The folder of the built browser app, to serve it next to the API. */
  staticRoot?: string
}

export function createApp({ staticRoot }: AppOptions = {}) {
  const app = new Hono()

  app.get('/api/checkout', (c) =>
    c.json({
      id: checkoutDefinitionId,
      definition: checkoutDefinition,
    } satisfies CheckoutFormResponse),
  )

  app.post('/api/orders', async (c) => {
    const locale = localeOf(c.req.header('accept-language'))
    const reject = (
      status: 400 | 409 | 422,
      code: OrderRejected['code'],
      messageKey: string,
      issues: OrderRejected['issues'] = [],
    ) =>
      c.json(
        {
          code,
          message: translate(locale, messageKey),
          issues,
        } satisfies OrderRejected,
        status,
      )

    const body: unknown = await c.req.json().catch(() => undefined)
    const request = v.safeParse(OrderRequestSchema, body)
    if (!request.success) {
      return reject(400, 'invalid_request', 'server.invalidBody')
    }
    if (request.output.definitionId !== checkoutDefinitionId) {
      return reject(409, 'outdated_definition', 'checkout.outdated')
    }

    // Never trust what a request sends: the same schema the form used, on the form's input.
    const result = v.safeParse(schemas[locale], request.output.input, {
      lang: locale,
    })
    if (!result.success) {
      return reject(
        422,
        'invalid_order',
        'checkout.rejected',
        result.issues.map((issue) => ({
          path: (issue.path ?? []).map((item) => item.key as string | number),
          message: issue.message,
        })),
      )
    }

    const order = result.output
    orderCount += 1
    return c.json(
      {
        orderId: `HC-${String(orderCount).padStart(5, '0')}`,
        order,
        total: totalOf(order.lines, order.delivery).total,
      } satisfies OrderAccepted,
      201,
    )
  })

  if (staticRoot) {
    app.use('*', serveStatic({ root: staticRoot }))
  }

  return app
}
