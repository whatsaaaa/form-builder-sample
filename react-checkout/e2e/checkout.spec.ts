import { expect, test, type Page } from '@playwright/test'

/** Fails when the page scrolls sideways: something is wider than the screen. */
async function expectNoSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
}

/** Fills in an order that is valid: two mugs, shipped to Zagreb, paid by card. */
async function fillValidOrder(page: Page) {
  await page.getByRole('textbox', { name: 'Email' }).fill('jana@example.com')
  await page.getByRole('button', { name: 'Add an item' }).click()
  const item = page.getByRole('region', { name: 'Item 1' })
  await item.getByLabel('Product').selectOption('Ceramic mug')
  await item.getByLabel('Quantity').fill('2')
  await page.getByRole('radio', { name: /^Standard/ }).check()
  await page.getByLabel('Full name').fill('Jana Kovač')
  await page.getByLabel('Street and number').fill('Ilica 1')
  await page.getByLabel('Postal code').fill('10000')
  await page.getByLabel('City').fill('Zagreb')
  await page.getByLabel('Country').selectOption('Croatia')
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
    email: 'jana@example.com',
    lines: [
      { product: 'mug', quantity: 2 },
      { product: 'notebook', quantity: 1 },
    ],
    delivery: 'standard',
    shipping: {
      fullName: 'Jana Kovač',
      street: 'Ilica 1',
      zip: '10000',
      city: 'Zagreb',
      country: 'HR',
    },
    paymentMethod: 'card',
    coupon: 'SPRING',
    acceptTerms: true,
  })
  await expectNoSidewaysScroll(page)
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
  await page.getByRole('textbox', { name: 'Email' }).fill('jana@example')
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
  await page.getByLabel('Company name').fill('Kovač d.o.o.')
  await page.getByRole('button', { name: 'Place order' }).click()

  await expect(page.getByText('Total paid: €28.00')).toBeVisible()
  expect(await confirmedOrder(page)).toMatchObject({
    delivery: 'pickup',
    shipping: {},
    paymentMethod: 'invoice',
    company: 'Kovač d.o.o.',
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
  await page.getByRole('textbox', { name: 'Email' }).fill('jana@example')
  await page.getByRole('button', { name: 'Add an item' }).click()
  await page.getByLabel('Product').selectOption('Canvas tote bag')
  await page.getByLabel('Quantity').fill('3')

  // Another language is another form. It starts with what the user typed.
  await page.getByRole('button', { name: 'Deutsch' }).click()
  await expect(page.getByRole('heading', { name: 'Kasse' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'E-Mail' })).toHaveValue(
    'jana@example',
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

  await page.getByRole('textbox', { name: 'E-Mail' }).fill('jana@example.com')
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
