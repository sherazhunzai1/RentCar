import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // host: true exposes the dev server on your network (0.0.0.0) so you can
    // open it from a phone on the same Wi-Fi via the printed "Network:" URL.
    host: true,
    port: 5173,
    open: true,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
