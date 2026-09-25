import { existsSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Serves the Vercel functions in api/ during `npm run dev`, so forms, /admin and the chat
// work locally. Settings come from .env.local; without Upstash credentials, requests are
// kept in memory until the dev server stops. Not used in production builds.
function localApi() {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value
      }
      process.env.JK_LOCAL_DEV = '1'

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const name = url.pathname.match(/^\/api\/([a-z-]+)$/)?.[1]
        if (!name || !existsSync(`api/${name}.js`)) return next()

        // Local only: let the mobile app's web preview (another port) call the API.
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          return res.end()
        }

        let raw = ''
        for await (const chunk of req) raw += chunk
        try {
          req.body = raw ? JSON.parse(raw) : {}
        } catch {
          req.body = {}
        }
        req.query = Object.fromEntries(url.searchParams)
        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
          return res
        }

        try {
          const { default: handler } = await server.ssrLoadModule(`/api/${name}.js`)
          await handler(req, res)
        } catch (error) {
          server.config.logger.error(error.stack || String(error))
          if (!res.headersSent) res.status(500).json({ error: 'Local API error. See the terminal.' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApi()],
  server: {
    host: '0.0.0.0',
  },
})
