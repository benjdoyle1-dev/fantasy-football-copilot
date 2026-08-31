import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // loadEnv with empty prefix reads ALL env vars, including non-VITE_ ones
  const env  = loadEnv(mode, process.cwd(), '')
  const s2   = env.ESPN_S2   ?? ''
  const swid = env.ESPN_SWID ?? ''

  return {
    plugins: [tailwindcss(), react()],

    // Inject SWID into the browser bundle so the app can identify which team
    // belongs to the authenticated user. espn_s2 never leaves the proxy.
    define: {
      __ESPN_SWID__: JSON.stringify(swid),
    },

    server: {
      proxy: {
        '/api/espn': {
          target:      'https://lm-api-reads.fantasy.espn.com',
          changeOrigin: true,
          rewrite:     (path) => path.replace(/^\/api\/espn/, '/apis/v3/games/ffl'),
          configure:   (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Cookie', `espn_s2=${s2}; SWID=${swid}`)
              proxyReq.setHeader('Accept', 'application/json')
            })
          },
        },
      },
    },
  }
})
