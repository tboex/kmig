import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from "@netlify/vite-plugin";


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    netlify(),
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: [
      'kmig.netlify.app', // production Netlify domain
      'devserver-main--kmig.netlify.app'
    ],
  },
  base: '/',
})
