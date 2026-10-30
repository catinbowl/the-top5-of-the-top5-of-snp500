import fs from 'node:fs'
import path from 'node:path'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const certDir = path.resolve(import.meta.dirname, '.cert')
const keyPath = path.join(certDir, 'key.pem')
const certPath = path.join(certDir, 'cert.pem')
const customHttps =
  fs.existsSync(keyPath) && fs.existsSync(certPath)
    ? {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    : undefined

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/the-top5-of-the-top5-of-snp500/' : '/',
  plugins: [
    react(),
    ...(!customHttps
      ? [
          basicSsl({
            name: 'snp500-local',
            domains: ['localhost', '*.local'],
          }),
        ]
      : []),
  ],
  server: {
    host: true, // Expose to local network (0.0.0.0)
    port: 5173,
    ...(customHttps ? { https: customHttps } : {}),
  },
  preview: {
    host: true, // Expose production preview over local network HTTPS too
    port: 4173,
    ...(customHttps ? { https: customHttps } : {}),
  },
}))
