import { keysInitScript } from '@whatsaaaa/design-system/shortcuts'
import { themeInitScript } from '@whatsaaaa/design-system/theme'
import { themeColorMeta } from '@whatsaaaa/design-system/theme/meta'
import vue from '@vitejs/plugin-vue'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * The design system's head tags, in the <head> before the stylesheet: the two theme-color tags,
 * so the page as it is sent colors the browser's bars, and the head scripts, inline, so a
 * remembered theme and a remembered "keys off" apply before the first paint. They come from the
 * installed package, so they stay in step with it.
 */
function designSystemHead(): Plugin {
  return {
    name: 'design-system-head',
    transformIndexHtml: {
      // before Vite adds the stylesheet and the app's script at the end of the <head>
      order: 'pre',
      handler: () => [
        ...themeColorMeta.map((attrs) => ({
          tag: 'meta',
          attrs: { ...attrs },
          injectTo: 'head' as const,
        })),
        { tag: 'script', children: themeInitScript, injectTo: 'head' },
        { tag: 'script', children: keysInitScript, injectTo: 'head' },
      ],
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), designSystemHead()],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
