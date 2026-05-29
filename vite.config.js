import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api/travelpayouts': {
          target: 'https://api.travelpayouts.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api\/travelpayouts\/v1/, '/v1'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const url = new URL(proxyReq.path, 'https://api.travelpayouts.com')
              url.searchParams.set('token', env.TRAVELPAYOUTS_TOKEN)
              proxyReq.path = url.pathname + url.search
            })
          },
        },
      },
    },
  }
})
