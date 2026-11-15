import { expect, test, type Locator, type Page } from '@playwright/test'

/** The label of the current step, from the step indicator. */
function currentStep(page: Page) {
  return page.locator('[aria-current="step"]')
}

function stepLabels(page: Page) {
  return page
    .getByRole('navigation', { name: 'Progress' })
    .getByRole('listitem')
}

async function next(page: Page) {
  await page.getByRole('button', { name: 'Next' }).click()
}

/**
 * Fails when something is wider than the screen: the page scrolls sideways, or a part of the
 * window frame clips it or scrolls it sideways: the window, its main area, its status line, or a
 * code block on show.
 */
async function expectNoSidewaysScroll(page: Page) {
  const boxes = [
    page.locator('html'),
    page.locator('.page'),
    page.locator('.page__main'),
    page.locator('.ws-status-line'),
    ...(await page.locator('.ws-code, .ws-code > pre').all()),
  ]
  for (const box of boxes) {
    const overflow = await box.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    )
    expect(overflow, `${box} is wider than its box`).toBeLessThanOrEqual(0)
  }
}

/** The text of each line an element's text is drawn on, from the top. */
function linesOf(element: Locator) {
  return element.evaluate((element) => {
    const lines: { top: number; text: string }[] = []
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    const range = document.createRange()
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent ?? ''
      for (let index = 0; index < text.length; index++) {
        range.setStart(node, index)
        range.setEnd(node, index + 1)
        const { top } = range.getBoundingClientRect()
        const line = lines.find((each) => Math.abs(each.top - top) < 1)
        if (line) line.text += text[index]
        else lines.push({ top, text: text[index] })
      }
    }
    return lines.map((line) => line.text)
  })
}

async function fillAboutYou(
  page: Page,
  ticket: 'Standard' | 'Student' | 'Business',
) {
  await page.getByRole('textbox', { name: 'First name' }).fill('  Marko ')
  await page.getByRole('textbox', { name: 'Last name' }).fill('Petrović')
  await page.getByRole('textbox', { name: 'Email' }).fill('marko@example.com')
  await page.getByRole('radio', { name: new RegExp(`^${ticket}`) }).check()
}

/** Registers a standard attendee for the keynote, with nothing more than it needs. */
async function registerStandard(page: Page) {
  await fillAboutYou(page, 'Standard')
  await next(page)
  await page.getByRole('checkbox', { name: 'Opening keynote' }).check()
  await next(page)
  await next(page)
  await page
    .getByRole('checkbox', { name: 'I accept the code of conduct' })
    .check()
  await page.getByRole('button', { name: 'Register' }).click()
  await expect(
    page.getByRole('heading', { name: "You're registered" }),
  ).toBeVisible()
}

/** The colors the registration on show is drawn in: one for plain text, more once highlighted. */
function outputColors(page: Page) {
  return page
    .getByTestId('output')
    .evaluate((element) => [
      ...new Set(
        [element, ...element.querySelectorAll('span')].map(
          (span) => getComputedStyle(span).color,
        ),
      ),
    ])
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('registers a business attendee with guests, step by step', async ({
  page,
}) => {
  // The invoice step only shows for a business ticket.
  await expect(stepLabels(page)).toHaveText([
    /About you/,
    /Your visit/,
    /Guests/,
    /Confirm/,
  ])
  await fillAboutYou(page, 'Business')
  await page.getByRole('textbox', { name: 'Phone' }).fill('+381 61 234 5678')
  await expect(stepLabels(page)).toHaveText([
    /About you/,
    /Your visit/,
    /Guests/,
    /Invoice/,
    /Confirm/,
  ])
  await expectNoSidewaysScroll(page)
  await next(page)

  await expect(currentStep(page)).toHaveText(/Your visit/)
  await page.getByLabel('Arrival').fill('2027-05-10')
  await page.getByLabel('Departure').fill('2027-05-11')
  // The workshop level only shows once the workshop is picked.
  await expect(page.getByLabel('Workshop level')).toHaveCount(0)
  await page.getByRole('checkbox', { name: 'Opening keynote' }).check()
  await page.getByRole('checkbox', { name: 'Hands-on forms workshop' }).check()
  await page.getByLabel('Workshop level').selectOption('Intermediate')
  await page
    .getByRole('checkbox', { name: 'I have access or dietary needs' })
    .check()
  await page.getByLabel('What do you need?').fill('Step-free access')
  await expectNoSidewaysScroll(page)
  await next(page)

  await expect(currentStep(page)).toHaveText(/Guests/)
  await expect(page.getByText('Nothing added yet.')).toBeVisible()
  await page.getByRole('button', { name: 'Add guest' }).click()
  const firstGuest = page.getByRole('region', { name: 'Guest 1' })
  await firstGuest
    .getByRole('textbox', { name: 'Name' })
    .fill('Nikola Petrović')
  await firstGuest
    .getByRole('textbox', { name: 'Email' })
    .fill('nikola@example.com')
  // A new item starts with the defaults of its fields.
  await expect(firstGuest.getByLabel('Meal')).toHaveValue('0')
  await page.getByRole('button', { name: 'Add guest' }).click()
  const secondGuest = page.getByRole('region', { name: 'Guest 2' })
  await secondGuest
    .getByRole('textbox', { name: 'Name' })
    .fill('Milica Nikolić')
  await secondGuest.getByLabel('Meal').selectOption('Vegan')
  await expectNoSidewaysScroll(page)
  await next(page)

  await expect(currentStep(page)).toHaveText(/Invoice/)
  await page.getByLabel('Company name').fill('Petrović d.o.o.')
  await page.getByLabel('VAT ID').fill('RS123456789')
  await page.getByLabel('Street and number').fill('Knez Mihailova 1')
  await page.getByLabel('City').fill('Belgrade')
  await page.getByLabel('ZIP code').fill('11000')
  await page.getByLabel('Country').selectOption('Serbia')
  await expectNoSidewaysScroll(page)
  await next(page)

  // The review tells every step back as text.
  await expect(currentStep(page)).toHaveText(/Confirm/)
  const summary = page.locator('.summary')
  await expect(summary).toContainText('Business - 490 EUR, with an invoice')
  await expect(summary).toContainText('10 May 2027')
  await expect(summary).toContainText(
    'Opening keynote, Hands-on forms workshop',
  )
  await expect(summary).toContainText('Milica Nikolić, Vegan')
  await expect(summary).toContainText('Serbia')
  await expectNoSidewaysScroll(page)

  await page
    .getByRole('checkbox', { name: 'I accept the code of conduct' })
    .check()
  await page.getByRole('button', { name: 'Register' }).click()

  await expect(
    page.getByRole('heading', { name: "You're registered" }),
  ).toBeVisible()
  const output = JSON.parse(
    (await page.getByTestId('output').textContent()) ?? '',
  ) as unknown
  expect(output).toEqual({
    firstName: 'Marko',
    lastName: 'Petrović',
    email: 'marko@example.com',
    phone: '+381 61 234 5678',
    ticketType: 'business',
    arrival: '2027-05-10',
    departure: '2027-05-11',
    sessions: ['keynote', 'workshop'],
    workshopLevel: 'intermediate',
    needsAssistance: true,
    assistanceDetails: 'Step-free access',
    guests: [
      {
        name: 'Nikola Petrović',
        email: 'nikola@example.com',
        meal: 'standard',
      },
      { name: 'Milica Nikolić', meal: 'vegan' },
    ],
    company: { name: 'Petrović d.o.o.', vatId: 'RS123456789' },
    billingAddress: {
      street: 'Knez Mihailova 1',
      city: 'Belgrade',
      zip: '11000',
      country: 'RS',
    },
    acceptTerms: true,
    newsletter: false,
  })
  await expectNoSidewaysScroll(page)
})

test('shows the registration as plain text until its highlighter loads, then in color', async ({
  page,
}) => {
  // The highlighter waits on its way, so the registration shows before it is there.
  let load: () => void = () => undefined
  const held = new Promise<void>((resolve) => {
    load = resolve
  })
  await page.route('**/assets/highlight-*.js', async (route) => {
    await held
    await route.continue()
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await registerStandard(page)

  const output = page.getByTestId('output')
  expect(JSON.parse((await output.textContent()) ?? '')).toMatchObject({
    email: 'marko@example.com',
  })
  expect(await outputColors(page)).toHaveLength(1)

  load()
  await expect
    .poll(async () => (await outputColors(page)).length)
    .toBeGreaterThan(1)
  expect(JSON.parse((await output.textContent()) ?? '')).toMatchObject({
    email: 'marko@example.com',
  })
})

test('shows the registration as plain text when its highlighter does not load', async ({
  page,
}) => {
  const errors: Error[] = []
  page.on('pageerror', (error) => errors.push(error))
  await page.route('**/assets/highlight-*.js', (route) => route.abort())
  await page.reload()
  await registerStandard(page)

  expect(
    JSON.parse((await page.getByTestId('output').textContent()) ?? ''),
  ).toMatchObject({ email: 'marko@example.com' })
  // Every piece of the registration is in the block's own text color.
  expect(await outputColors(page)).toHaveLength(1)
  expect(errors).toEqual([])
})

test('keeps the user on a step until its fields are valid', async ({
  page,
}) => {
  // Nothing filled in: every required field of the step reports, and the first one is focused.
  await next(page)
  await expect(currentStep(page)).toHaveText(/About you/)
  await expect(page.getByText('Enter your first name')).toBeVisible()
  await expect(page.getByText('Enter your last name')).toBeVisible()
  await expect(page.getByText('Enter your email')).toBeVisible()
  await expect(page.getByText('Choose a ticket')).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'First name' })).toBeFocused()
  await expectNoSidewaysScroll(page)

  // The messages of rules, and of a field that only shows for a student ticket.
  await fillAboutYou(page, 'Student')
  await page.getByRole('textbox', { name: 'Email' }).fill('marko@example')
  await page.getByRole('textbox', { name: 'Phone' }).fill('call me')
  await next(page)
  await expect(currentStep(page)).toHaveText(/About you/)
  await expect(page.getByText('Enter a valid email address')).toBeVisible()
  await expect(
    page.getByText('Use digits and spaces, like +381 61 234 5678'),
  ).toBeVisible()
  await expect(page.getByText('Enter your student ID')).toBeVisible()
  await expect(page.getByText('Enter your first name')).toHaveCount(0)

  // A failed step checks itself again as it is fixed.
  await page.getByRole('textbox', { name: 'Email' }).fill('marko@example.com')
  await expect(page.getByText('Enter a valid email address')).toHaveCount(0)
  await page.getByRole('textbox', { name: 'Phone' }).fill('')
  await page.getByLabel('Student ID').fill('ST-2027-01')
  await next(page)

  // The next step starts clean, though the whole form was validated.
  await expect(currentStep(page)).toHaveText(/Your visit/)
  await expect(page.getByText('Pick at least one session')).toHaveCount(0)

  // A form rule that compares two fields, and a rule on a list of choices.
  await page.getByLabel('Arrival').fill('2027-05-12')
  await page.getByLabel('Departure').fill('2027-05-10')
  for (const session of [
    'Opening keynote',
    'Accessible forms',
    'Fast forms at scale',
    'Lightning talks',
  ]) {
    await page.getByRole('checkbox', { name: session }).check()
  }
  await next(page)
  await expect(currentStep(page)).toHaveText(/Your visit/)
  await expect(
    page.getByText("Departure can't be before arrival"),
  ).toBeVisible()
  await expect(page.getByText('Pick up to three sessions')).toBeVisible()

  await page.getByLabel('Departure').fill('2027-05-12')
  await page.getByRole('checkbox', { name: 'Lightning talks' }).uncheck()
  await next(page)

  // A guest without a name, and with the attendee's own email.
  await expect(currentStep(page)).toHaveText(/Guests/)
  await page.getByRole('button', { name: 'Add guest' }).click()
  const guest = page.getByRole('region', { name: 'Guest 1' })
  await guest.getByRole('textbox', { name: 'Email' }).fill('marko@example.com')
  await next(page)
  await expect(currentStep(page)).toHaveText(/Guests/)
  await expect(page.getByText("Enter the guest's name")).toBeVisible()
  await guest.getByRole('textbox', { name: 'Name' }).fill('Nikola Petrović')
  await next(page)
  await expect(currentStep(page)).toHaveText(/Guests/)
  await expect(
    page.getByText('A guest needs an email of their own'),
  ).toBeVisible()
  await expectNoSidewaysScroll(page)
  await page.getByRole('button', { name: 'Remove guest 1' }).click()
  await next(page)

  // The last step: no registration without the code of conduct.
  await expect(currentStep(page)).toHaveText(/Confirm/)
  await page.getByRole('button', { name: 'Register' }).click()
  await expect(
    page.getByText('Please accept the code of conduct'),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: "You're registered" }),
  ).toHaveCount(0)
})

test('clears what a condition hides', async ({ page }) => {
  await fillAboutYou(page, 'Student')
  await page.getByLabel('Student ID').fill('ST-2027-01')

  // Another ticket hides the student ID and clears it, so it is blank when it comes back.
  await page.getByRole('radio', { name: /^Standard/ }).check()
  await expect(page.getByLabel('Student ID')).toHaveCount(0)
  await page.getByRole('radio', { name: /^Student/ }).check()
  await expect(page.getByLabel('Student ID')).toHaveValue('')

  // A standard ticket skips the invoice step, and submits nothing of it.
  await page.getByRole('radio', { name: /^Standard/ }).check()
  await next(page)
  await page.getByRole('checkbox', { name: 'Opening keynote' }).check()
  await next(page)
  await next(page)
  await expect(currentStep(page)).toHaveText(/Confirm/)
  await page
    .getByRole('checkbox', { name: 'I accept the code of conduct' })
    .check()
  await page.getByRole('button', { name: 'Register' }).click()

  const output = JSON.parse(
    (await page.getByTestId('output').textContent()) ?? '',
  ) as Record<string, unknown>
  expect(output).not.toHaveProperty('studentId')
  expect(output.ticketType).toBe('standard')
  expect(output.company).toEqual({})
  expect(output.billingAddress).toEqual({})
})

test('moves with Enter and with the step indicator', async ({ page }) => {
  await fillAboutYou(page, 'Business')

  // Enter in a text input is a Next, not an early submit, and the new step takes the focus.
  await page.getByRole('textbox', { name: 'Last name' }).press('Enter')
  await expect(currentStep(page)).toHaveText(/Your visit/)
  await expect(page.getByRole('heading', { name: 'Your visit' })).toBeFocused()

  // Going back is free, and keeps what was typed.
  await page.getByRole('button', { name: /About you/ }).click()
  await expect(currentStep(page)).toHaveText(/About you/)
  await expect(page.getByRole('textbox', { name: 'Last name' })).toHaveValue(
    'Petrović',
  )

  // Going forward validates each step on the way, and stops at the first with errors.
  await page.getByRole('button', { name: /Confirm/ }).click()
  await expect(currentStep(page)).toHaveText(/Your visit/)
  await expect(page.getByText('Pick at least one session')).toBeVisible()
  await page.getByRole('checkbox', { name: 'Opening keynote' }).check()
  await page.getByRole('button', { name: /Confirm/ }).click()
  await expect(currentStep(page)).toHaveText(/Invoice/)
  await expect(page.getByText('Enter the company name')).toBeVisible()
})

// 320 px is the width the content must reflow to (WCAG 1.4.10), and 390 px a common phone.
for (const width of [320, 390]) {
  for (const colorScheme of ['dark', 'light'] as const) {
    test.describe(`on a ${width} px screen, in the ${colorScheme} theme`, () => {
      test.use({ viewport: { width, height: 844 }, colorScheme })

      test('fits the screen at every step, with its errors', async ({
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

        await next(page)
        await expect(page.getByText('Enter your first name')).toBeVisible()
        await expectNoSidewaysScroll(page)
        // The keys switch is a letter wider off than on, and the status line still holds it.
        const keys = page.getByRole('switch', { name: 'Shortcut keys' })
        await keys.click()
        await expect(keys).toHaveText(/keys\s*off/, { useInnerText: true })
        await expectNoSidewaysScroll(page)
        await fillAboutYou(page, 'Business')
        await page
          .getByRole('textbox', { name: 'Phone' })
          .fill('+381 61 234 5678')
        await next(page)

        await next(page)
        await expect(page.getByText('Pick at least one session')).toBeVisible()
        await expectNoSidewaysScroll(page)
        await page
          .getByRole('checkbox', { name: 'Hands-on forms workshop' })
          .check()
        await page.getByLabel('Workshop level').selectOption('Advanced')
        await page
          .getByRole('checkbox', { name: 'I have access or dietary needs' })
          .check()
        await page
          .getByLabel('What do you need?')
          .fill('Pristup bez stepenica, i čaj bez šećera za večeru.')
        await expectNoSidewaysScroll(page)
        await next(page)

        await page.getByRole('button', { name: 'Add guest' }).click()
        await next(page)
        await expect(page.getByText("Enter the guest's name")).toBeVisible()
        await expectNoSidewaysScroll(page)
        await page
          .getByRole('region', { name: 'Guest 1' })
          .getByRole('textbox', { name: 'Name' })
          .fill('Đurđa Živković')
        await next(page)

        await next(page)
        await expect(page.getByText('Enter the company name')).toBeVisible()
        await expectNoSidewaysScroll(page)
        await page.getByLabel('Company name').fill('Petrović d.o.o.')
        await page.getByLabel('Street and number').fill('Knez Mihailova 1')
        await page.getByLabel('City').fill('Belgrade')
        await page.getByLabel('ZIP code').fill('11000')
        await page.getByLabel('Country').selectOption('Serbia')
        await next(page)

        await expect(currentStep(page)).toHaveText(/Confirm/)
        // A long email breaks after its "@" when it has to, not in the middle of a word.
        const email = page
          .locator('.summary dl > div', {
            has: page.getByText('Email', { exact: true }),
          })
          .locator('dd')
        const lines = await linesOf(email)
        expect(lines, 'the email breaks in the middle of a word').toEqual(
          lines.length === 1
            ? ['marko@example.com']
            : ['marko@', 'example.com'],
        )
        await page.getByRole('button', { name: 'Register' }).click()
        await expect(
          page.getByText('Please accept the code of conduct'),
        ).toBeVisible()
        await expectNoSidewaysScroll(page)
        await page
          .getByRole('checkbox', { name: 'I accept the code of conduct' })
          .check()
        await page.getByRole('button', { name: 'Register' }).click()
        await expect(
          page.getByRole('heading', { name: "You're registered" }),
        ).toBeVisible()
        await expectNoSidewaysScroll(page)
      })
    })
  }
}
