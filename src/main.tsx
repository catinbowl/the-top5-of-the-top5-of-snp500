import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Service Worker for SPA & offline PWA capabilities
if ('serviceWorker' in navigator && (import.meta.env.PROD || window.location.search.includes('sw=true'))) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`
    navigator.serviceWorker
      .register(swUrl, { scope: import.meta.env.BASE_URL })
      .then((registration) => {
        console.log('[SW] Service Worker registered successfully:', registration.scope)
      })
      .catch((error) => {
        console.warn('[SW] Service Worker registration failed:', error)
      })
  })
}
