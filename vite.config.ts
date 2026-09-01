import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],

  server: {
    // Forward all /api/* requests to the Express backend.
    // ESPN credentials are held exclusively by the backend — never injected here.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
