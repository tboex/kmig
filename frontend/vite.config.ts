import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: [
      'devserver-main--timely-sprinkles-8ead71.netlify.app',
      'timely-sprinkles-8ead71.netlify.app', // production Netlify domain
    ],
  }
})
