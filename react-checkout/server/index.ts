import { serve } from '@hono/node-server'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { createApp } from './app'

const port = Number(process.env.PORT ?? 8787)

// `tsx server/index.ts dist` also serves the built browser app, so one process runs the shop.
// Without a folder, it is the API only: in development, Vite serves the app and proxies `/api`.
const staticRoot = process.argv[2]
if (staticRoot && !existsSync(join(staticRoot, 'index.html'))) {
  console.error(
    `No build in "${staticRoot}". Run "pnpm build" first, or start the API alone.`,
  )
  process.exit(1)
}

serve({ fetch: createApp({ staticRoot }).fetch, port }, (info) => {
  console.log(
    `Checkout server on http://localhost:${String(info.port)}` +
      (staticRoot ? `, serving the app from ${staticRoot}` : ', API only'),
  )
})
