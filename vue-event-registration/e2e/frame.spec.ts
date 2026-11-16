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

/**
 * Fails when the status line cuts what it holds. It fits in the line, and its path shows whole or
 * not at all: when it shows, five characters and an ellipsis fit in its text box, and the text has
 * as much room before the keys switch as after the mode. It is gone only when those and its
 * padding have no room there.
 */
async function expectStatusLineWhole(page: Page) {
  const line = await page.locator('.ws-status-line').evaluate((line) => {
    const find = (selector: string) => {
      const element = line.querySelector(selector)
      if (!element) throw new Error(`The status line has no ${selector}`)
      return element
    }
    const path = find('.ws-status-line__file')
    const text = find('.ws-status-line__file > span')
    const pathStyle = getComputedStyle(path)
    const textStyle = getComputedStyle(text)
    const probe = document.createElement('span')
    probe.style.position = 'absolute'
    probe.style.font = textStyle.font
    probe.textContent = 'xxxxx…'
    document.body.append(probe)
    const shortest = probe.getBoundingClientRect().width
    probe.remove()
    const mode = find('.ws-status-line__mode').getBoundingClientRect().right
    const keys = find('.ws-status-line__switch').getBoundingClientRect().left
    const box = text.getBoundingClientRect()
    const left = box.left + parseFloat(textStyle.paddingLeft)
    const right = box.right - parseFloat(textStyle.paddingRight)
    return {
      overflow: line.scrollWidth - line.clientWidth,
      shown: path.checkVisibility(),
      room: keys - mode,
      needed:
        shortest +
        parseFloat(pathStyle.paddingLeft) +
        parseFloat(pathStyle.paddingRight) +
        parseFloat(textStyle.paddingLeft) +
        parseFloat(textStyle.paddingRight),
      text: right - left,
      shortest,
      before: left - mode,
      after: keys - right,
    }
  })
  expect(line.overflow, 'the status line cuts its end').toBeLessThanOrEqual(0)
  if (line.shown) {
    expect(
      line.text,
      'the path shows less than five characters',
    ).toBeGreaterThanOrEqual(line.shortest)
    expect(
      line.after,
      'the path runs into the keys switch',
    ).toBeGreaterThanOrEqual(line.before)
  } else {
    expect(
      line.room,
      'the path is gone with room for five characters',
    ).toBeLessThan(line.needed)
  }
  return line.shown
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

for (const colorScheme of ['dark', 'light'] as const) {
  test.describe(`in the ${colorScheme} theme`, () => {
    test.use({ colorScheme })

    // From the width the content must reflow to (WCAG 1.4.10) up, with each width of the switch.
    test('keeps the status line whole on a narrow screen', async ({ page }) => {
      let shown = 0
      for (const keys of ['on', 'off']) {
        if (keys === 'off') await keysSwitch(page).click()
        await expect(keysSwitch(page)).toHaveText(
          new RegExp(`keys\\s*${keys}`),
          {
            useInnerText: true,
          },
        )
        for (let width = 320; width <= 400; width += 2) {
          await page.setViewportSize({ width, height: 700 })
          if (await expectStatusLineWhole(page)) shown++
        }
      }
      // The path showed at some width, so the checks of a shown path ran too.
      expect(shown).toBeGreaterThan(0)
    })
  })
}
