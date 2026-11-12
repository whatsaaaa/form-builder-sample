import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development, the API runs on its own port (`pnpm dev` starts both).
    proxy: { '/api': 'http://localhost:8787' },
  },
  test: {
    include: ['{src,shared,server}/**/*.test.ts'],
  },
})
