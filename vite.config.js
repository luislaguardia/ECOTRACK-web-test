import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'add-security-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('X-Frame-Options', 'DENY')
          res.setHeader('X-Content-Type-Options', 'nosniff')
          
          res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: http://localhost:5003 https://upload.wikimedia.org https://encrypted-tbn0.gstatic.com https://encrypted-tbn1.gstatic.com https://encrypted-tbn2.gstatic.com https://encrypted-tbn3.gstatic.com https://imgs.search.brave.com; font-src 'self' data:; connect-src 'self' http://localhost:5003 data:; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; manifest-src 'self'; media-src 'self'; worker-src 'self'; child-src 'none';")
          next()
        })
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5003',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5003',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
