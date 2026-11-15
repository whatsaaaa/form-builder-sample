import { expect, type Page } from '@playwright/test'

/**
 * Fails when the page scrolls sideways, or when a part of the window cuts something off at its
 * side. The window, its bars and its code block hide what is wider than they are, so that would
 * not make the page scroll.
 */
export async function expectNoSidewaysScroll(page: Page, message?: string) {
  const overflowing = await page.evaluate(() =>
    [
      'html',
      '.ws-term',
      '.page__main',
      '.ws-tab-bar',
      '.ws-status-line',
      '.ws-code',
      '.ws-code > pre',
    ].filter((selector) =>
      [...document.querySelectorAll(selector)].some(
        (element) => element.scrollWidth > element.clientWidth,
      ),
    ),
  )
  expect(overflowing, message).toEqual([])
}

/**
 * Fails when the status line cuts what it holds. The mode, the keys switch and the name of the
 * theme are whole and inside it, and its path shows whole or not at all: when it shows, "~…" fits
 * in its text box, and the text has as much room before the keys switch as after the mode. It is
 * gone only when "~…" and its padding have no room there. Says whether the path showed.
 */
export async function expectStatusLineWhole(page: Page, message?: string) {
  const line = await page.locator('.ws-status-line').evaluate((line) => {
    const find = (selector: string) => {
      const element = line.querySelector(selector)
      if (!element) throw new Error(`The status line has no ${selector}`)
      return element
    }
    const edge = line.getBoundingClientRect()
    const items = {
      mode: '.ws-status-line__mode',
      keys: '.ws-status-line__switch',
      theme: '.ws-status-line__theme',
    }
    const cut = Object.entries(items).flatMap(([name, selector]) => {
      const shown = [...line.querySelectorAll(selector)].filter((element) =>
        element.checkVisibility(),
      )
      if (shown.length !== 1) return [`${name}: ${String(shown.length)} shown`]
      const element = shown[0] as Element
      const box = element.getBoundingClientRect()
      // Half a pixel for the rounding of fractional layout on a phone.
      const inside =
        box.left >= edge.left - 0.5 && box.right <= edge.right + 0.5
      const whole = element.scrollWidth <= element.clientWidth
      return inside && whole ? [] : [`${name}: cut`]
    })
    const path = find('.ws-status-line__file')
    const text = find('.ws-status-line__file > span')
    const pathStyle = getComputedStyle(path)
    const textStyle = getComputedStyle(text)
    const probe = document.createElement('span')
    probe.style.position = 'absolute'
    probe.style.font = textStyle.font
    probe.textContent = '~…'
    document.body.append(probe)
    const shortest = probe.getBoundingClientRect().width
    probe.remove()
    const mode = find('.ws-status-line__mode').getBoundingClientRect().right
    const keys = find('.ws-status-line__switch').getBoundingClientRect().left
    const box = text.getBoundingClientRect()
    const left = box.left + parseFloat(textStyle.paddingLeft)
    const right = box.right - parseFloat(textStyle.paddingRight)
    return {
      cut,
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
  const at = message ? ` ${message}` : ''
  expect(line.cut, `a working item is cut${at}`).toEqual([])
  expect(
    line.overflow,
    `the status line cuts its end${at}`,
  ).toBeLessThanOrEqual(0)
  if (line.shown) {
    expect(line.text, `the path shows a cut glyph${at}`).toBeGreaterThanOrEqual(
      line.shortest,
    )
    expect(
      line.after,
      `the path runs into the keys switch${at}`,
    ).toBeGreaterThanOrEqual(line.before)
  } else {
    expect(line.room, `the path is gone with room for "~…"${at}`).toBeLessThan(
      line.needed,
    )
  }
  return line.shown
}
