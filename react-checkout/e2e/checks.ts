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
 * Fails unless every working item of the status line is whole and inside it: the mode, the keys
 * switch and the name of the theme. The path is decoration: it may shrink or go, but when it shows,
 * it is readable, "~…" at the least, and no glyph of it is cut through.
 */
export async function expectWholeStatusLine(page: Page, message?: string) {
  const problems = await page.evaluate(() => {
    const line = document.querySelector('.ws-status-line')
    if (!line) return ['no status line']
    const edge = line.getBoundingClientRect()
    const items = {
      mode: '.ws-status-line__mode',
      keys: '.ws-status-line__switch',
      theme: '.status-line__theme',
    }
    const found = Object.entries(items).flatMap(([name, selector]) => {
      const shown = [...line.querySelectorAll(selector)].filter(
        (element) => element.getClientRects().length > 0,
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
    const path = line.querySelector('.ws-status-line__file > span')
    if (path && path.getClientRects().length > 0) {
      // The text's own width, cut or not: the path is in a font of one width for every glyph.
      const range = document.createRange()
      range.selectNodeContents(path)
      const text = range.getBoundingClientRect().width
      const glyph = text / (path.textContent ?? ' ').length
      const style = getComputedStyle(path)
      const room =
        path.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight)
      const box = path.getBoundingClientRect()
      const frame = path.parentElement?.getBoundingClientRect()
      // All of it, or as much as its ellipsis leaves: one glyph and the ellipsis at the least.
      const readable = room >= text - 0.5 || room >= 2 * glyph - 0.5
      const inside = !frame || box.right <= frame.right + 0.5
      if (!readable || !inside) found.push('path: cut')
    }
    return found
  })
  expect(problems, message).toEqual([])
}
