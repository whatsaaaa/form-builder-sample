import { expect, test, type Page } from '@playwright/test'
import { expectNoSidewaysScroll, expectStatusLineWhole } from './checks'

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
  await expect(page.getByRole('button', { name: 'Place order' })).toBeVisible()
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
    const email = page.getByRole('textbox', { name: 'Email' })
    await email.press('t')
    await expect(email).toHaveValue('t')
    await expect(mode).toHaveText('INSERT')
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await email.blur()
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
          { useInnerText: true },
        )
        for (let width = 320; width <= 400; width += 2) {
          await page.setViewportSize({ width, height: 700 })
          const at = `at ${String(width)} px with the keys ${keys}`
          if (await expectStatusLineWhole(page, at)) shown++
          await expectNoSidewaysScroll(page, at)
        }
      }
      // The path showed at some width, so the checks of a shown path ran too.
      expect(shown).toBeGreaterThan(0)

      // "INSERT" takes the place of "NORMAL" while a field has focus.
      await page.setViewportSize({ width: 320, height: 700 })
      await page.getByRole('textbox', { name: 'Email' }).focus()
      await expect(page.locator('.ws-status-line__mode')).toHaveText('INSERT')
      await expectStatusLineWhole(page, 'at 320 px while typing')
    })
  })
}

/**
 * How much ink the label of a button has: the pixels of its text box, less the edge where text
 * meets its ground, that are not the box's most common color, the ground itself. A label drawn in
 * the color of what is right behind it has none.
 */
async function labelInk(page: Page, name: string) {
  const text = await page.getByRole('button', { name }).evaluate((button) => {
    const range = document.createRange()
    range.selectNodeContents(button)
    const { x, y, width, height } = range.getBoundingClientRect()
    return { x: x + 2, y: y + 2, width: width - 4, height: height - 4 }
  })
  const shot = await page.screenshot({ clip: text })
  return page.evaluate(async (png) => {
    const image = new Image()
    image.src = `data:image/png;base64,${png}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error('No 2D context to read the shot with')
    context.drawImage(image, 0, 0)
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
    // One word to a pixel, so each color counts as one value.
    const pixels = new Uint32Array(data.buffer)
    const counts = new Map<number, number>()
    for (const pixel of pixels) counts.set(pixel, (counts.get(pixel) ?? 0) + 1)
    return pixels.length - Math.max(...counts.values())
  }, shot.toString('base64'))
}

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`in forced colors, on a ${colorScheme} system`, () => {
    test.use({ forcedColors: 'active', colorScheme })

    // The browser paints every background in the page's color, so a fill alone would say nothing.
    // The pressed language and a ticked box take the system's color for a selection instead.
    test('tells the pressed language and a ticked box from the others', async ({
      page,
    }) => {
      const fill = (name: string, role: 'button' | 'checkbox') =>
        page
          .getByRole(role, { name })
          .evaluate((element) => getComputedStyle(element).backgroundColor)

      // The system's selection color, on an element the browser leaves as it is.
      const selection = await page.evaluate(() => {
        const probe = document.createElement('div')
        probe.style.forcedColorAdjust = 'none'
        probe.style.background = 'Highlight'
        document.body.append(probe)
        const color = getComputedStyle(probe).backgroundColor
        probe.remove()
        return color
      })

      expect(await fill('English', 'button')).toBe(selection)
      expect(await fill('Deutsch', 'button')).not.toBe(selection)

      const terms = 'I accept the terms of sale'
      expect(await fill(terms, 'checkbox')).not.toBe(selection)
      await page.getByRole('checkbox', { name: terms }).check()
      expect(await fill(terms, 'checkbox')).toBe(selection)
    })

    // The browser puts a plate of the page's color behind text so it can be read. A label in the
    // color of that plate is not there at all, pressed or not.
    test('shows the name of each language, pressed or not', async ({
      page,
    }) => {
      for (const pressed of ['English', 'Deutsch']) {
        await page.getByRole('button', { name: pressed }).click()
        await expect(
          page.getByRole('button', { name: pressed }),
        ).toHaveAttribute('aria-pressed', 'true')
        for (const name of ['English', 'Deutsch']) {
          expect(
            await labelInk(page, name),
            `${name} with ${pressed} pressed`,
          ).toBeGreaterThan(0)
        }
      }
    })

    // The browser rings the control in focus in a color of the system's, whatever the theme's.
    test('rings the pressed language in focus as it rings the other', async ({
      page,
    }) => {
      const english = page.getByRole('button', { name: 'English' })
      const deutsch = page.getByRole('button', { name: 'Deutsch' })
      const ring = async (button: typeof english) => {
        await expect(button).toBeFocused()
        return button.evaluate((element) => ({
          shown: element.matches(':focus-visible'),
          color: getComputedStyle(element).outlineColor,
        }))
      }

      await english.focus()
      await page.keyboard.press('Tab')
      const other = await ring(deutsch)
      await page.keyboard.press('Shift+Tab')
      const pressed = await ring(english)

      expect(other.shown).toBe(true)
      expect(pressed).toEqual(other)
    })
  })
}
