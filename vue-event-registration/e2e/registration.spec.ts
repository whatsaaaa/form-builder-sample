import { expect, test, type Page } from '@playwright/test'

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

/** Fails when the page scrolls sideways: something is wider than the screen. */
async function expectNoSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
}

async function fillAboutYou(
  page: Page,
  ticket: 'Standard' | 'Student' | 'Business',
) {
  await page.getByRole('textbox', { name: 'First name' }).fill('  Ana ')
  await page.getByRole('textbox', { name: 'Last name' }).fill('Horvat')
  await page.getByRole('textbox', { name: 'Email' }).fill('ana@example.com')
  await page.getByRole('radio', { name: new RegExp(`^${ticket}`) }).check()
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
  await page.getByRole('textbox', { name: 'Phone' }).fill('+385 91 234 5678')
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
  await firstGuest.getByRole('textbox', { name: 'Name' }).fill('Ivo Horvat')
  await firstGuest
    .getByRole('textbox', { name: 'Email' })
    .fill('ivo@example.com')
  // A new item starts with the defaults of its fields.
  await expect(firstGuest.getByLabel('Meal')).toHaveValue('0')
  await page.getByRole('button', { name: 'Add guest' }).click()
  const secondGuest = page.getByRole('region', { name: 'Guest 2' })
  await secondGuest.getByRole('textbox', { name: 'Name' }).fill('Mia Novak')
  await secondGuest.getByLabel('Meal').selectOption('Vegan')
  await expectNoSidewaysScroll(page)
  await next(page)

  await expect(currentStep(page)).toHaveText(/Invoice/)
  await page.getByLabel('Company name').fill('Horvat d.o.o.')
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
  await expect(summary).toContainText('Mia Novak, Vegan')
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
    firstName: 'Ana',
    lastName: 'Horvat',
    email: 'ana@example.com',
    phone: '+385 91 234 5678',
    ticketType: 'business',
    arrival: '2027-05-10',
    departure: '2027-05-11',
    sessions: ['keynote', 'workshop'],
    workshopLevel: 'intermediate',
    needsAssistance: true,
    assistanceDetails: 'Step-free access',
    guests: [
      { name: 'Ivo Horvat', email: 'ivo@example.com', meal: 'standard' },
      { name: 'Mia Novak', meal: 'vegan' },
    ],
    company: { name: 'Horvat d.o.o.', vatId: 'RS123456789' },
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
  await page.getByRole('textbox', { name: 'Email' }).fill('ana@example')
  await page.getByRole('textbox', { name: 'Phone' }).fill('call me')
  await next(page)
  await expect(currentStep(page)).toHaveText(/About you/)
  await expect(page.getByText('Enter a valid email address')).toBeVisible()
  await expect(
    page.getByText('Use digits and spaces, like +385 91 234 5678'),
  ).toBeVisible()
  await expect(page.getByText('Enter your student ID')).toBeVisible()
  await expect(page.getByText('Enter your first name')).toHaveCount(0)

  // A failed step checks itself again as it is fixed.
  await page.getByRole('textbox', { name: 'Email' }).fill('ana@example.com')
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
  await guest.getByRole('textbox', { name: 'Email' }).fill('ana@example.com')
  await next(page)
  await expect(currentStep(page)).toHaveText(/Guests/)
  await expect(page.getByText("Enter the guest's name")).toBeVisible()
  await guest.getByRole('textbox', { name: 'Name' }).fill('Ivo Horvat')
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
    'Horvat',
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
