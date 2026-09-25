// "Install as app" support: service worker registration and the Android install prompt.

export function registerServiceWorker() {
  // Dev server keeps its own caching rules; the worker only runs on the built site.
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  const register = () => navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('Service worker failed:', error))
  // Register after the page has loaded so it doesn't compete with first paint.
  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
}

// True when the site is already running as an installed app.
export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

// iPhone/iPad Safari can't show an install button; people add it via Share → Add to Home Screen.
export const isIosSafari = () => {
  const ua = window.navigator.userAgent
  const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

// Chrome/Edge/Samsung fire `beforeinstallprompt` once; keep it until the user taps Install.
let deferredPrompt = null
const listeners = new Set()
const notify = () => listeners.forEach((listener) => listener(Boolean(deferredPrompt)))

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    notify()
  })
}

export function onInstallAvailable(listener) {
  listeners.add(listener)
  listener(Boolean(deferredPrompt))
  return () => listeners.delete(listener)
}

export async function promptInstall() {
  if (!deferredPrompt) return false
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  notify()
  return outcome === 'accepted'
}
