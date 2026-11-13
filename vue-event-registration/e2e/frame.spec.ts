import { expect, test, type Page } from '@playwright/test'

/** The item of the status line that names the theme on show, and switches it. */
function themeName(page: Page, name: 'rose-pine' | 'rose-pine-dawn') {
  return page.getByRole('button', {
    name: `Switch theme, now ${name}`,
    exact: true,
  })
}

function keysSwitch(page: Page) {
  return page.getByRole('switch', { name: 'Shortcut keys' })
}

/** The color of the page behind the window: it changes with the theme. */
function pageColor(page: Page) {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('on a light system', () => {
  test.use({ colorScheme: 'light' })

  test('switches the theme, and remembers it', async ({ page }) => {
    const html = page.locator('html')

    // Until it is switched, the theme is the system's.
    await expect(html).not.toHaveAttribute('data-theme')
    await expect(themeName(page, 'rose-pine-dawn')).toBeVisible()
    await expect(themeName(page, 'rose-pine')).toBeHidden()
    const light = await pageColor(page)

    await themeName(page, 'rose-pine-dawn').click()
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await expect(themeName(page, 'rose-pine')).toBeVisible()
    await expect(themeName(page, 'rose-pine-dawn')).toBeHidden()
    const dark = await pageColor(page)
    expect(dark).not.toBe(light)

    // The head script applies the choice again before the page is drawn.
    await page.reload()
    await expect(html).toHaveAttribute('data-theme', 'dark')
    expect(await pageColor(page)).toBe(dark)

    await themeName(page, 'rose-pine').click()
    await expect(html).toHaveAttribute('data-theme', 'light')
    expect(await pageColor(page)).toBe(light)
  })
})

test('switches the shortcut keys off and on, and remembers it', async ({
  page,
}) => {
  const html = page.locator('html')
  await expect(keysSwitch(page)).toBeChecked()
  await expect(keysSwitch(page)).toHaveText(/keys\s*on/, {
    useInnerText: true,
  })
  await expect(html).toHaveAttribute('data-ws-keys', 'on')

  await keysSwitch(page).click()
  await expect(keysSwitch(page)).not.toBeChecked()
  await expect(keysSwitch(page)).toHaveText(/keys\s*off/, {
    useInnerText: true,
  })
  await expect(html).toHaveAttribute('data-ws-keys', 'off')

  await page.reload()
  await expect(keysSwitch(page)).not.toBeChecked()
  await expect(html).toHaveAttribute('data-ws-keys', 'off')

  await keysSwitch(page).click()
  await expect(keysSwitch(page)).toBeChecked()
  await expect(html).toHaveAttribute('data-ws-keys', 'on')
})

test.describe('on a dark system', () => {
  test.use({ colorScheme: 'dark' })

  test('switches the theme with the t key while the keys are on', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Key hints show on a wide screen only')
    const html = page.locator('html')
    const hint = page.getByRole('button', { name: 'Switch theme', exact: true })
    const mode = page.locator('.ws-status-line__mode')
    await expect(hint.locator('kbd')).toBeVisible()
    await expect(mode).toHaveText('NORMAL')

    await page.keyboard.press('t')
    await expect(html).toHaveAttribute('data-theme', 'light')
    await page.keyboard.press('t')
    await expect(html).toHaveAttribute('data-theme', 'dark')

    // A key typed into a field is only a letter.
    const firstName = page.getByRole('textbox', { name: 'First name' })
    await firstName.press('t')
    await expect(firstName).toHaveValue('t')
    await expect(mode).toHaveText('INSERT')
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await firstName.blur()
    await expect(mode).toHaveText('NORMAL')

    // With the keys off, the key rests and its cap goes, but the button still works by hand.
    await keysSwitch(page).click()
    await expect(hint.locator('kbd')).toBeHidden()
    await page.keyboard.press('t')
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await hint.click()
    await expect(html).toHaveAttribute('data-theme', 'light')
  })
})
