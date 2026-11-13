import { expect, test, type Page } from '@playwright/test'
import { expectNoSidewaysScroll } from './checks'

/** Fills in an order that is valid: two mugs, shipped to Belgrade, paid by card. */
async function fillValidOrder(page: Page) {
  await page.getByRole('textbox', { name: 'Email' }).fill('jelena@example.com')
  await page.getByRole('button', { name: 'Add an item' }).click()
  const item = page.getByRole('region', { name: 'Item 1' })
  await item.getByLabel('Product').selectOption('Ceramic mug')
  await item.getByLabel('Quantity').fill('2')
  await page.getByRole('radio', { name: /^Standard/ }).check()
  await page.getByLabel('Full name').fill('Jelena Jovanović')
  await page.getByLabel('Street and number').fill('Knez Mihailova 1')
  await page.getByLabel('Postal code').fill('11000')
  await page.getByLabel('City').fill('Belgrade')
  await page.getByLabel('Country').selectOption('Serbia')
  await page.getByRole('checkbox', { name: /terms of sale/ }).check()
}

/** The order the server confirmed, from the confirmation page. */
async function confirmedOrder(page: Page) {
  return JSON.parse(
    (await page.getByTestId('order').textContent()) ?? '',
  ) as unknown
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Place order' })).toBeVisible()
})

test('places an order that the server validates and prices again', async ({
  page,
}) => {
  await expectNoSidewaysScroll(page)
  await fillValidOrder(page)

  // A second item, and a coupon that the schema trims and upper-cases.
  await page.getByRole('button', { name: 'Add an item' }).click()
  const second = page.getByRole('region', { name: 'Item 2' })
  await second.getByLabel('Product').selectOption('Dot grid notebook')
  // A new item starts with the defaults of its fields.
  await expect(second.getByLabel('Quantity')).toHaveValue('1')
  await page.getByLabel('Coupon code').fill(' spring ')

  // The summary follows the form as it is filled in.
  const summary = page.getByTestId('summary')
  await expect(summary).toContainText('2 x Ceramic mug')
  await expect(summary).toContainText('1 x Dot grid notebook')
  await expect(summary).toContainText('€42.40')
  await expectNoSidewaysScroll(page)

  await page.getByRole('button', { name: 'Place order' }).click()

  await expect(
    page.getByRole('heading', { name: 'Thank you for your order' }),
  ).toBeVisible()
  // The total comes from the server, which worked it out from the validated order.
  await expect(page.getByText('Total paid: €42.40')).toBeVisible()
  expect(await confirmedOrder(page)).toEqual({
    email: 'jelena@example.com',
    lines: [
      { product: 'mug', quantity: 2 },
      { product: 'notebook', quantity: 1 },
    ],
    delivery: 'standard',
    shipping: {
      fullName: 'Jelena Jovanović',
      street: 'Knez Mihailova 1',
      zip: '11000',
      city: 'Belgrade',
      country: 'RS',
    },
    paymentMethod: 'card',
    coupon: 'SPRING',
    acceptTerms: true,
  })
  await expectNoSidewaysScroll(page)
})

test('keeps the order button faint while it is sent, under the pointer too', async ({
  page,
}) => {
  await fillValidOrder(page)

  // The order waits on its way to the server, so the button stays as it is while it is sent.
  let send = () => {}
  const held = new Promise<void>((resolve) => {
    send = resolve
  })
  await page.route('**/api/orders', async (route) => {
    await held
    await route.continue()
  })
  await page.getByRole('button', { name: 'Place order' }).click()

  const sending = page.getByRole('button', { name: 'Placing your order...' })
  await expect(sending).toBeDisabled()
  const look = () =>
    sending.evaluate((element) => {
      const style = getComputedStyle(element)
      return [style.color, style.borderColor, style.backgroundColor]
    })
  // The pointer is still where it clicked: on the button.
  const hovered = await look()
  await page.mouse.move(0, 0)
  expect(hovered).toEqual(await look())

  send()
  await expect(
    page.getByRole('heading', { name: 'Thank you for your order' }),
  ).toBeVisible()
})

test('shows the order as plain text when its highlighter does not load', async ({
  page,
}) => {
  const errors: Error[] = []
  page.on('pageerror', (error) => errors.push(error))
  await page.route('**/assets/highlight-*.js', (route) => route.abort())
  await page.reload()
  await fillValidOrder(page)
  await page.getByRole('button', { name: 'Place order' }).click()

  await expect(
    page.getByRole('heading', { name: 'Thank you for your order' }),
  ).toBeVisible()
  expect(await confirmedOrder(page)).toMatchObject({
    email: 'jelena@example.com',
  })
  // Every piece of the order is in the block's own text color.
  const order = page.getByTestId('order')
  const colors = await order.evaluate((element) => [
    ...new Set(
      [element, ...element.querySelectorAll('span')].map(
        (span) => getComputedStyle(span).color,
      ),
    ),
  ])
  expect(colors).toHaveLength(1)
  expect(errors).toEqual([])
})

test('stops an invalid order in the browser, before it reaches the server', async ({
  page,
}) => {
  let requests = 0
  page.on('request', (request) => {
    if (request.url().endsWith('/api/orders')) requests += 1
  })

  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(page.getByText('Enter your email')).toBeVisible()
  await expect(page.getByText('Add at least one item')).toBeVisible()
  await expect(page.getByText('Choose how to get your order')).toBeVisible()
  await expect(page.getByText('Please accept the terms of sale')).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeFocused()
  await expectNoSidewaysScroll(page)

  // The messages of rules: a format, a whole number in a range, a pattern.
  await page.getByRole('textbox', { name: 'Email' }).fill('jelena@example')
  await page.getByRole('button', { name: 'Add an item' }).click()
  await page.getByLabel('Quantity').fill('11')
  await page.getByLabel('Postal code').fill('ABC')
  await page.getByLabel('Coupon code').fill('no')
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(page.getByText('Enter a valid email address')).toBeVisible()
  await expect(page.getByText('Choose a product')).toBeVisible()
  await expect(page.getByText('Order up to ten of one product')).toBeVisible()
  await expect(page.getByText('Use 4 or 5 digits')).toBeVisible()
  await expect(
    page.getByText('A coupon code has six letters or digits'),
  ).toBeVisible()
  await page.getByLabel('Quantity').fill('1.5')
  await expect(page.getByText('Enter a whole number')).toBeVisible()

  expect(requests).toBe(0)
  await expect(
    page.getByRole('heading', { name: 'Thank you for your order' }),
  ).toHaveCount(0)
})

test('shows the fields a condition asks for, and drops what it hides', async ({
  page,
}) => {
  await fillValidOrder(page)

  // Picked up at the shop: no address to fill in, none in the order, and nothing to pay for it.
  await page.getByRole('radio', { name: /^Pick up/ }).check()
  await expect(page.getByLabel('Full name')).toHaveCount(0)
  await expect(page.getByTestId('summary')).toContainText(/Delivery\s*€0\.00/)

  // Paid by invoice: the company name shows, and is required.
  await expect(page.getByLabel('Company name')).toHaveCount(0)
  await page.getByRole('radio', { name: /^Invoice/ }).check()
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(page.getByText('Enter the company name')).toBeVisible()
  await page.getByLabel('Company name').fill('Jovanović d.o.o.')
  await page.getByRole('button', { name: 'Place order' }).click()

  await expect(page.getByText('Total paid: €28.00')).toBeVisible()
  expect(await confirmedOrder(page)).toMatchObject({
    delivery: 'pickup',
    shipping: {},
    paymentMethod: 'invoice',
    company: 'Jovanović d.o.o.',
  })
})

test('shows the server rejecting an order that got past the browser', async ({
  page,
}) => {
  await fillValidOrder(page)

  // The order is valid when it leaves the form. It is changed on its way to the server, as a
  // script or a stale tab could: the server must not trust what the browser checked.
  await page.route('**/api/orders', async (route) => {
    const body = route.request().postDataJSON() as {
      definitionId: string
      input: {
        lines: { quantity: unknown }[]
        shipping: { zip: string }
      }
    }
    const line = body.input.lines[0]
    if (line) line.quantity = 99
    body.input.shipping.zip = 'ABC'
    await route.continue({ postData: JSON.stringify(body) })
  })
  const response = page.waitForResponse('**/api/orders')
  await page.getByRole('button', { name: 'Place order' }).click()
  expect((await response).status()).toBe(422)

  // The server's messages show on the fields they belong to, and no order is confirmed.
  await expect(
    page.getByText(
      'We could not take your order. Please check the marked fields.',
    ),
  ).toBeVisible()
  await expect(page.getByText('Order up to ten of one product')).toBeVisible()
  await expect(page.getByText('Use 4 or 5 digits')).toBeVisible()
  await expect(page.getByLabel('Quantity')).toBeFocused()
  await expect(
    page.getByRole('heading', { name: 'Thank you for your order' }),
  ).toHaveCount(0)
  await expectNoSidewaysScroll(page)

  // The same order, sent as the form has it, is accepted.
  await page.unroute('**/api/orders')
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(
    page.getByRole('heading', { name: 'Thank you for your order' }),
  ).toBeVisible()
})

test('speaks German in the browser and on the server, and keeps the input', async ({
  page,
}) => {
  await page.getByRole('textbox', { name: 'Email' }).fill('jelena@example')
  await page.getByRole('button', { name: 'Add an item' }).click()
  await page.getByLabel('Product').selectOption('Canvas tote bag')
  await page.getByLabel('Quantity').fill('3')

  // Another language is another form. It starts with what the user typed.
  await page.getByRole('button', { name: 'Deutsch' }).click()
  await expect(page.getByRole('heading', { name: 'Kasse' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'E-Mail' })).toHaveValue(
    'jelena@example',
  )
  await expect(page.getByTestId('summary')).toContainText('3 x Stofftasche')
  await expect(page.getByTestId('summary')).toContainText('54,00 €')
  await expectNoSidewaysScroll(page)

  // The browser's messages, from the same keys.
  await page.getByRole('button', { name: 'Bestellung aufgeben' }).click()
  await expect(
    page.getByText('Geben Sie eine gültige E-Mail-Adresse ein'),
  ).toBeVisible()
  await expect(page.getByText('Wählen Sie eine Lieferart')).toBeVisible()
  await expectNoSidewaysScroll(page)

  await page.getByRole('textbox', { name: 'E-Mail' }).fill('jelena@example.com')
  await page.getByRole('radio', { name: /^Abholung/ }).check()
  await page.getByRole('checkbox', { name: /Verkaufsbedingungen/ }).check()

  // The server's messages: the quantity is changed on its way, to one no input could send.
  await page.route('**/api/orders', async (route) => {
    const body = route.request().postDataJSON() as {
      input: { lines: { quantity: unknown }[] }
    }
    const line = body.input.lines[0]
    if (line) line.quantity = 'viele'
    await route.continue({ postData: JSON.stringify(body) })
  })
  await page.getByRole('button', { name: 'Bestellung aufgeben' }).click()
  await expect(
    page.getByText(
      'Wir konnten Ihre Bestellung nicht annehmen. Bitte prüfen Sie die markierten Felder.',
    ),
  ).toBeVisible()
  // A message of Valibot's own, translated by its i18n package.
  await expect(
    page.getByText('Ungültiger Typ: number erwartet aber "viele" erhalten'),
  ).toBeVisible()

  await page.unroute('**/api/orders')
  await page.getByRole('button', { name: 'Bestellung aufgeben' }).click()
  await expect(
    page.getByRole('heading', { name: 'Vielen Dank für Ihre Bestellung' }),
  ).toBeVisible()
  await expect(page.getByText('Bezahlter Betrag: 54,00 €')).toBeVisible()
})

test('the server rejects invalid data sent straight to its API', async ({
  request,
}) => {
  const form = (await (await request.get('/api/checkout')).json()) as {
    id: string
  }
  const response = await request.post('/api/orders', {
    headers: { 'Accept-Language': 'en' },
    data: {
      definitionId: form.id,
      input: { email: 'nobody', lines: [], acceptTerms: false },
    },
  })
  expect(response.status()).toBe(422)
  const rejection = (await response.json()) as {
    issues: { path: (string | number)[]; message: string }[]
  }
  expect(rejection.issues).toEqual(
    expect.arrayContaining([
      { path: ['email'], message: 'Enter a valid email address' },
      { path: ['lines'], message: 'Add at least one item' },
      { path: ['acceptTerms'], message: 'Please accept the terms of sale' },
    ]),
  )
})

// 320 px is the width a page has to work at without scrolling sideways (WCAG's reflow), 390 px a
// common phone.
for (const [width, colorScheme] of [
  [320, 'dark'],
  [320, 'light'],
  [390, 'dark'],
  [390, 'light'],
] as const) {
  test.describe(`on a ${String(width)} px screen, in the ${colorScheme} theme`, () => {
    test.use({ viewport: { width, height: 844 }, colorScheme })

    test('fits the screen in English and in German, with its errors', async ({
      page,
    }) => {
      // The page follows the system's theme, and names it in the status line.
      const name = colorScheme === 'dark' ? 'rose-pine' : 'rose-pine-dawn'
      await expect(
        page.getByRole('button', {
          name: `Switch theme, now ${name}`,
          exact: true,
        }),
      ).toBeVisible()
      await expectNoSidewaysScroll(page)

      await page.getByRole('button', { name: 'Place order' }).click()
      await expect(page.getByText('Enter your email')).toBeVisible()
      await expectNoSidewaysScroll(page)
      await fillValidOrder(page)
      await page
        .getByLabel('Note for the courier')
        .fill('Zvonite kod Đorđevića, ulaz iz dvorišta. Čuvar je u prizemlju.')
      await expectNoSidewaysScroll(page)

      // German labels, buttons and messages are longer.
      await page.getByRole('button', { name: 'Deutsch' }).click()
      await expect(page.getByRole('heading', { name: 'Kasse' })).toBeVisible()
      await expectNoSidewaysScroll(page)

      // The server's messages on the fields, as in the test of a changed order above.
      await page.route('**/api/orders', async (route) => {
        const body = route.request().postDataJSON() as {
          input: {
            lines: { quantity: unknown }[]
            shipping: { zip: string }
          }
        }
        const line = body.input.lines[0]
        if (line) line.quantity = 99
        body.input.shipping.zip = 'ABC'
        await route.continue({ postData: JSON.stringify(body) })
      })
      await page.getByRole('button', { name: 'Bestellung aufgeben' }).click()
      await expect(
        page.getByText('Bestellen Sie höchstens zehn Stück eines Produkts'),
      ).toBeVisible()
      await expect(
        page.getByText('Verwenden Sie 4 oder 5 Ziffern'),
      ).toBeVisible()
      await expectNoSidewaysScroll(page)

      await page.unroute('**/api/orders')
      await page.getByRole('button', { name: 'Bestellung aufgeben' }).click()
      await expect(
        page.getByRole('heading', { name: 'Vielen Dank für Ihre Bestellung' }),
      ).toBeVisible()
      await expectNoSidewaysScroll(page)
    })
  })
}
