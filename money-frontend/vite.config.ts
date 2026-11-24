import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Прокси решает CORS и https-сертификат в dev
    proxy: {
      '/api': {
        target: 'https://localhost:7297', // из launchSettings.json
        changeOrigin: true,
        secure: false, // для self-signed cert в dev
      },
    },
  },
});
