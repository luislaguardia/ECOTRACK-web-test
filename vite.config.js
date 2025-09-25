import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import crypto from 'crypto'

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
          
          // Development CSP - allows unsafe-eval and unsafe-inline for Vite HMR
          const isDev = process.env.NODE_ENV === 'development'
          const scriptSrc = isDev 
            ? `'self' 'unsafe-inline' 'unsafe-eval'` 
            : `'self' 'sha256-sv7hbimefIgr5H+bCTJv/Ot/c4+D5HEUsa+XdoCrgmU='`
          
          // For styles, we still need unsafe-inline due to React inline styles and Tailwind
          // This is a known limitation with React and CSS-in-JS libraries
          const styleSrc = `'self' 'unsafe-inline' https://fonts.googleapis.com`
          
          res.setHeader('Content-Security-Policy', `default-src 'self'; script-src ${scriptSrc}; style-src ${styleSrc}; img-src 'self' data: http://localhost:5003 http://localhost:5174 https://ecotrack.online https://ecotrack-iq4x.onrender.com https://ecotrack-kcab.onrender.com https://upload.wikimedia.org https://encrypted-tbn0.gstatic.com https://encrypted-tbn1.gstatic.com https://encrypted-tbn2.gstatic.com https://encrypted-tbn3.gstatic.com https://imgs.search.brave.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http://localhost:5003 http://localhost:5174 https://ecotrack.online https://ecotrack-iq4x.onrender.com https://ecotrack-kcab.onrender.com data:; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; manifest-src 'self'; media-src 'self'; worker-src 'self'; child-src 'none';`)
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
