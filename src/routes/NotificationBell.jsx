import { useEffect, useRef, useState } from 'react'
import { Bell, ClipboardList, MessagesSquare, Star, Trash2 } from 'lucide-react'
import { timeAgo, timeFormat } from './adminApi'

const icons = { request: ClipboardList, chat: MessagesSquare, review: Star }

// Saved notification history (from the server), so nothing is missed when a banner disappears.
export default function NotificationBell({ items, seenAt, onOpen, onSelect, onClear }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const unread = items.filter((item) => item.at > seenAt).length

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => {
      if (event.key === 'Escape' || (event.type === 'mousedown' && !panelRef.current?.contains(event.target))) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  const toggle = () => {
    if (!open && unread) onOpen()
    setOpen((value) => !value)
  }

  return (
    <div className="admin-bell" ref={panelRef}>
      <button type="button" className="admin-btn admin-bell-button" onClick={toggle} aria-expanded={open} aria-label={unread ? `Notifications, ${unread} new` : 'Notifications'}>
        <Bell size={16} />
        {unread > 0 && <span className="admin-bell-count">{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className="admin-bell-panel" role="dialog" aria-label="Notification history">
          <header>
            <strong>Notifications</strong>
            {items.length > 0 && (
              <button type="button" className="admin-bell-clear" onClick={() => { if (window.confirm('Clear the notification history?')) onClear() }}>
                <Trash2 size={14} /> Clear
              </button>
            )}
          </header>
          {items.length === 0 ? (
            <p className="admin-bell-empty">Nothing yet. New bookings, chat messages and reviews are saved here.</p>
          ) : (
            <ul>
              {items.map((item) => {
                const Icon = icons[item.type] ?? Bell
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={item.at > seenAt ? 'is-unread' : ''}
                      onClick={() => {
                        setOpen(false)
                        onSelect(item.link)
                      }}
                    >
                      <Icon size={16} aria-hidden="true" />
                      <span className="admin-bell-text">
                        <strong>{item.title}</strong>
                        {item.body && <span>{item.body}</span>}
                      </span>
                      <time dateTime={new Date(item.at).toISOString()} title={timeFormat.format(item.at)}>{timeAgo(item.at)}</time>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
