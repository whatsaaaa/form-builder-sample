import { keysInitScript } from '@whatsaaaa/design-system/shortcuts'
import { themeInitScript } from '@whatsaaaa/design-system/theme'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * The design system's head scripts, inline in the <head> before the stylesheet: a remembered
 * theme and a remembered "keys off" apply before the first paint. They come from the installed
 * package, so they stay in step with it.
 */
function designSystemHead(): Plugin {
  return {
    name: 'design-system-head',
    transformIndexHtml: {
      // before Vite adds the stylesheet and the app's script at the end of the <head>
      order: 'pre',
      handler: () => [
        { tag: 'script', children: themeInitScript, injectTo: 'head' },
        { tag: 'script', children: keysInitScript, injectTo: 'head' },
      ],
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), designSystemHead()],
  server: {
    // In development, the API runs on its own port (`pnpm dev` starts both).
    proxy: { '/api': 'http://localhost:8787' },
  },
  test: {
    include: ['{src,shared,server}/**/*.test.ts'],
  },
})
