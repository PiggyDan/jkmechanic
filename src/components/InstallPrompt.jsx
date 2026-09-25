import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Download, Share, SquarePlus, X } from 'lucide-react'
import { isIosSafari, isStandalone, onInstallAvailable, promptInstall } from '../lib/pwa'
import './install-prompt.css'

const DISMISS_KEY = 'jk-install-dismissed'
const SHOW_AFTER_MS = 6000
const REMIND_AFTER_DAYS = 14

const wasDismissedRecently = () => {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0)
    return Date.now() - at < REMIND_AFTER_DAYS * 86400000
  } catch {
    return false
  }
}

// One-time suggestion on phones to add Garage 84 to the home screen.
// Android: real Install button. iPhone: short Share → Add to Home Screen instructions.
export default function InstallPrompt() {
  const location = useLocation()
  const admin = location.pathname.startsWith('/admin')
  const [canPrompt, setCanPrompt] = useState(false)
  const [visible, setVisible] = useState(false)
  const ios = isIosSafari()

  useEffect(() => onInstallAvailable(setCanPrompt), [])

  useEffect(() => {
    const phone = window.matchMedia('(max-width: 760px)').matches
    if (!phone || isStandalone() || wasDismissedRecently()) return undefined
    const timer = setTimeout(() => setVisible(true), admin ? 1500 : SHOW_AFTER_MS)
    return () => clearTimeout(timer)
  }, [admin])

  if (!visible || (!canPrompt && !ios)) return null

  const dismiss = () => {
    setVisible(false)
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch { /* Shows again next visit. */ }
  }

  const install = async () => {
    if (await promptInstall()) setVisible(false)
  }

  const name = admin ? 'Garage 84 Admin' : 'Garage 84'

  return (
    <aside className={`install-prompt${admin ? ' install-prompt-admin' : ''}`} role="dialog" aria-label={`Install ${name}`}>
      <img src={admin ? '/icons/admin-icon-192.png' : '/icons/icon-192.png'} alt="" width="48" height="48" />
      <div className="install-copy">
        <strong>Add {name} to your phone</strong>
        {canPrompt ? (
          <span>{admin ? 'Open bookings and chats in one tap, full screen.' : 'Book, call and chat in one tap, like an app.'}</span>
        ) : (
          <span>
            Tap <Share size={14} aria-label="Share" /> then <b>Add to Home Screen</b> <SquarePlus size={14} aria-hidden="true" />
          </span>
        )}
      </div>
      {canPrompt && (
        <button type="button" className="install-button" onClick={install}>
          <Download size={16} /> Install
        </button>
      )}
      <button type="button" className="install-close" onClick={dismiss} aria-label="Not now"><X size={18} /></button>
    </aside>
  )
}
