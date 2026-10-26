import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/the-top5-of-the-top5-of-snp500/' : '/',
  plugins: [react()],
  server: {
    host: true, // Expose to local network (0.0.0.0)
    port: 5173,
  },
}))
