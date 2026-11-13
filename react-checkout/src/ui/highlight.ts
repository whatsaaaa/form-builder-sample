import { codeTheme } from '@whatsaaaa/design-system/shiki'
import {
  codeToTokensBase,
  createShikiPrimitive,
  type ThemedToken,
} from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import json from 'shiki/langs/json.mjs'

// JSON is the one language the app shows. Shiki's primitive gives tokens and leaves out its HTML
// renderer, and the JavaScript engine needs no WebAssembly, so a block is highlighted at once.
const shiki = createShikiPrimitive({
  themes: [codeTheme],
  langs: [json],
  engine: createJavaScriptRegexEngine(),
})

/** The lines of a piece of JSON, as tokens colored by the design system's code theme. */
export function highlightJson(code: string): ThemedToken[][] {
  return codeToTokensBase(shiki, code, { lang: 'json', theme: codeTheme.name })
}
