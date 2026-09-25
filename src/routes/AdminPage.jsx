import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Archive, ArchiveRestore, Bell, BellOff, BellRing, CalendarClock, CalendarDays, Check, ClipboardList, Download, LogOut, Mail, MessagesSquare, Phone, RefreshCw, RotateCcw, Star, Trash2, Volume2, VolumeX, X,
} from 'lucide-react'
import ThemeToggle from '../../components/ThemeToggle.jsx'
import AdminChats from './AdminChats'
import AdminSchedule from './AdminSchedule'
import AdminReviews from './AdminReviews'
import NotificationBell from './NotificationBell'
import { formatLongDay } from '../data/schedule'
import { downloadCsv, requestsToCsv } from '../lib/exportCsv'
import { adminApi, chatLabel, playChime, timeAgo, timeFormat } from './adminApi'
import './admin.css'
import BrandMark from '../components/BrandMark'

const TOKEN_KEY = 'jk-admin-token'
const SOUND_KEY = 'jk-admin-sound'
const POLL_MS = 15000

const readToken = () => {
  try { return sessionStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}
const writeToken = (value) => {
  try {
    if (value) sessionStorage.setItem(TOKEN_KEY, value)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch { /* Storage may be disabled; the token then lasts until reload. */ }
}
const readSound = () => {
  try { return localStorage.getItem(SOUND_KEY) !== 'off' } catch { return true }
}

function LoginForm({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await adminApi(password, 'requests')
      onLogin(password)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="admin-login" onSubmit={handleSubmit}>
      <BrandMark />
      <h1>Admin sign in</h1>
      <p>Booking requests and website chats.</p>
      <label>
        <span>Password</span>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" autoFocus required />
      </label>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <button type="submit" className="primary-button" disabled={busy}>{busy ? 'Checking…' : 'Sign in'}</button>
      <Link to="/" className="admin-back">← Back to website</Link>
    </form>
  )
}

function RequestCard({ request, fresh, onStatus, onDelete }) {
  const isNew = request.status === 'new'
  return (
    <article className={`admin-card${isNew ? ' is-new' : ''}${fresh ? ' is-fresh' : ''}`}>
      <header>
        <div>
          <h2>{request.name}</h2>
          <p className="admin-meta">
            {request.service || 'General enquiry'}
            {request.source && <> · {request.source}</>}
          </p>
        </div>
        <div className="admin-card-side">
          {isNew && <span className="admin-badge">New</span>}
          <time dateTime={new Date(request.createdAt).toISOString()} title={timeFormat.format(request.createdAt)}>
            {timeAgo(request.createdAt)}
          </time>
        </div>
      </header>

      {request.appointment && (
        <p className="admin-appointment">
          <CalendarClock size={16} /> {formatLongDay(request.appointment.date)} at <strong>{request.appointment.time}</strong>
        </p>
      )}

      <div className="admin-contact">
        <a href={`tel:${request.phone.replace(/[^\d+]/g, '')}`}><Phone size={15} /> {request.phone}</a>
        {request.email && <a href={`mailto:${request.email}`}><Mail size={15} /> {request.email}</a>}
      </div>

      {request.fields.length > 0 && (
        <dl className="admin-fields">
          {request.fields.map((field) => (
            <div key={field.label}>
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <footer>
        <span className="admin-exact-time">{timeFormat.format(request.createdAt)}</span>
        <div className="admin-card-actions">
          {request.status === 'archived' ? (
            <>
              <button type="button" className="admin-btn" onClick={() => onStatus(request, 'handled')}>
                <ArchiveRestore size={15} /> Restore
              </button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={() => onDelete(request)}>
                <Trash2 size={15} /> Delete forever
              </button>
            </>
          ) : (
            <>
              {isNew ? (
                <button type="button" className="admin-btn admin-btn-primary" onClick={() => onStatus(request, 'handled')}>
                  <Check size={15} /> Mark handled
                </button>
              ) : (
                <button type="button" className="admin-btn" onClick={() => onStatus(request, 'new')}>
                  <RotateCcw size={15} /> Mark as new
                </button>
              )}
              <button type="button" className="admin-btn" onClick={() => onStatus(request, 'archived')} title="Archive: hide it but keep it saved" aria-label={`Archive request from ${request.name}`}>
                <Archive size={15} />
              </button>
            </>
          )}
        </div>
      </footer>
    </article>
  )
}

// While on /admin, "Add to Home Screen" should create the separate Garage 84 Admin app.
function useAdminAppIdentity() {
  useEffect(() => {
    const manifest = document.querySelector('link[rel="manifest"]')
    const touchIcon = document.querySelector('link[rel="apple-touch-icon"]')
    const title = document.querySelector('meta[name="apple-mobile-web-app-title"]')
    const previous = [manifest?.href, touchIcon?.href, title?.content]
    manifest?.setAttribute('href', '/admin.webmanifest')
    touchIcon?.setAttribute('href', '/icons/admin-apple-touch-icon.png')
    title?.setAttribute('content', 'G84 Admin')
    document.body.classList.add('is-admin')
    return () => {
      if (previous[0]) manifest.setAttribute('href', previous[0])
      if (previous[1]) touchIcon.setAttribute('href', previous[1])
      if (previous[2]) title.setAttribute('content', previous[2])
      document.body.classList.remove('is-admin')
    }
  }, [])
}

function AdminPage() {
  useAdminAppIdentity()
  const [token, setToken] = useState(readToken)
  const [view, setView] = useState('requests')
  const [requests, setRequests] = useState(null)
  const [chats, setChats] = useState({ conversations: [], aiAvailable: false })
  const [reviews, setReviews] = useState([])
  const [activity, setActivity] = useState({ items: [], seenAt: 0 })
  const [selectedChat, setSelectedChat] = useState(null)
  const [filter, setFilter] = useState('new')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState(null)
  const [alertsOn, setAlertsOn] = useState(() => typeof Notification !== 'undefined' && Notification.permission === 'granted')
  const [soundOn, setSoundOn] = useState(readSound)
  const [toast, setToast] = useState(null)
  const [freshIds, setFreshIds] = useState(() => new Set())
  const known = useRef(null) // what was on screen at the last check: { requests: Set<id>, unread: Map<chatId, count> }
  const openChatId = useRef(null) // the chat you are reading right now needs no banner

  useEffect(() => {
    openChatId.current = view === 'chats' ? selectedChat : null
  }, [view, selectedChat])

  const logout = useCallback(() => {
    writeToken('')
    setToken('')
    setRequests(null)
    known.current = null
  }, [])

  // Banner + chime (+ optional browser pop-up) for anything that arrived since the last check.
  const announce = useCallback((alert) => {
    setToast({ ...alert, at: Date.now() })
    if (soundOn) playChime()
    if (alertsOn) {
      try {
        new Notification(alert.title, { body: alert.body, tag: 'jk-admin' })
      } catch {
        // Mobile browsers (e.g. Android Chrome) block page notifications; the banner still shows.
      }
    }
  }, [soundOn, alertsOn])

  const applyData = useCallback((requestList, chatData, reviewList) => {
    if (known.current) {
      const freshRequests = requestList.filter((item) => item.status === 'new' && !known.current.requests.has(item.id))
      const freshChats = chatData.conversations.filter(
        (chat) => chat.id !== openChatId.current && chat.unread > (known.current.unread.get(chat.id) ?? 0),
      )

      if (freshChats.length) {
        announce({
          title: freshChats.length === 1 ? `New chat message from ${chatLabel(freshChats[0])}` : `${freshChats.length} chats have new messages`,
          body: freshChats[0].last || 'Website chat',
          view: 'chats',
          chatId: freshChats.length === 1 ? freshChats[0].id : null,
        })
      } else if (freshRequests.length) {
        announce({
          title: freshRequests.length === 1 ? `New request from ${freshRequests[0].name}` : `${freshRequests.length} new requests`,
          body: freshRequests.length === 1 ? freshRequests[0].service || 'Website request' : freshRequests.map((item) => item.name).join(', '),
          view: 'requests',
        })
      } else {
        const freshReviews = reviewList.filter((review) => review.status === 'pending' && !known.current.reviews.has(review.id))
        if (freshReviews.length) {
          announce({
            title: freshReviews.length === 1 ? `New ${freshReviews[0].rating}★ review from ${freshReviews[0].name}` : `${freshReviews.length} new reviews`,
            body: freshReviews[0].text,
            view: 'reviews',
          })
        }
      }
      if (freshRequests.length) setFreshIds((current) => new Set([...current, ...freshRequests.map((item) => item.id)]))
    }
    known.current = {
      requests: new Set(requestList.map((item) => item.id)),
      unread: new Map(chatData.conversations.map((chat) => [chat.id, chat.unread])),
      reviews: new Set(reviewList.map((review) => review.id)),
    }
    setRequests(requestList)
    setChats(chatData)
    setReviews(reviewList)
    setLastChecked(new Date())
  }, [announce])

  const refresh = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [requestData, chatData, reviewData, activityData] = await Promise.all([
        adminApi(token, 'requests'),
        adminApi(token, 'chats'),
        adminApi(token, 'reviews', 'GET', { query: '?all=1' }),
        adminApi(token, 'activity'),
      ])
      applyData(requestData.requests, chatData, reviewData.reviews)
      setActivity(activityData)
      setError('')
    } catch (err) {
      if (err.status === 401) logout()
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, applyData, logout])

  useEffect(() => {
    if (!token) return undefined
    refresh() // eslint-disable-line react-hooks/set-state-in-effect -- initial load; the fetch runs asynchronously
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible' || alertsOn) refresh()
    }, POLL_MS)
    // Check straight away when you come back to the tab.
    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [token, refresh, alertsOn])

  // Hide the banner after 12 seconds.
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 12000)
    return () => clearTimeout(timer)
  }, [toast])

  const newCount = requests?.filter((item) => item.status === 'new').length ?? 0
  const unreadChats = chats.conversations.filter((chat) => chat.unread > 0).length
  const pendingReviews = reviews.filter((review) => review.status === 'pending').length

  useEffect(() => {
    const total = newCount + unreadChats + pendingReviews
    document.title = total ? `(${total}) Admin · JK Mechanic` : 'Admin · JK Mechanic'
    return () => { document.title = 'Garage 84 · JK Mechanic, Gachuurt' }
  }, [newCount, unreadChats, pendingReviews])

  const handleError = useCallback((err) => {
    if (err.status === 401) logout()
    else setError(err.message)
  }, [logout])

  const handleLogin = (password) => {
    writeToken(password)
    setToken(password)
  }

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    try { localStorage.setItem(SOUND_KEY, next ? 'on' : 'off') } catch { /* Storage may be disabled. */ }
    if (next) playChime()
  }

  const toggleAlerts = async () => {
    if (alertsOn) return setAlertsOn(false)
    if (typeof Notification === 'undefined') return setError('This browser does not support notifications.')
    const permission = await Notification.requestPermission()
    if (permission === 'granted') setAlertsOn(true)
    else setError('Notifications are blocked. Allow them in your browser settings for this site.')
  }

  // Jump to whatever a notification is about (from the banner or the bell's history).
  const goTo = (link) => {
    if (!link) return
    setView(link.view)
    if (link.view === 'requests') {
      setFilter('new')
      setSearch('')
    }
    if (link.view === 'chats' && link.id) setSelectedChat(link.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const markActivitySeen = async () => {
    try {
      setActivity(await adminApi(token, 'activity', 'POST'))
    } catch (err) {
      handleError(err)
    }
  }

  const clearActivity = async () => {
    try {
      setActivity(await adminApi(token, 'activity', 'DELETE'))
    } catch (err) {
      handleError(err)
    }
  }

  const openToast = () => {
    setView(toast.view)
    if (toast.view === 'requests') {
      setFilter('new')
      setSearch('')
    } else if (toast.chatId) {
      setSelectedChat(toast.chatId)
    }
    setToast(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateStatus = async (request, status) => {
    setFreshIds((current) => {
      const next = new Set(current)
      next.delete(request.id)
      return next
    })
    setRequests((list) => list.map((item) => (item.id === request.id ? { ...item, status } : item)))
    try {
      await adminApi(token, 'requests', 'PATCH', { body: { id: request.id, status } })
    } catch (err) {
      handleError(err)
      refresh()
    }
  }

  const deleteRequest = async (request) => {
    if (!window.confirm(`Delete the request from ${request.name} forever? It will be gone from the saved records. This cannot be undone.`)) return
    setRequests((list) => list.filter((item) => item.id !== request.id))
    try {
      await adminApi(token, 'requests', 'DELETE', { query: `?id=${encodeURIComponent(request.id)}` })
    } catch (err) {
      handleError(err)
      refresh()
    }
  }

  if (!token) {
    return (
      <div className="admin-page">
        <LoginForm onLogin={handleLogin} />
      </div>
    )
  }

  const counts = {
    new: newCount,
    handled: requests?.filter((item) => item.status === 'handled').length ?? 0,
    archived: requests?.filter((item) => item.status === 'archived').length ?? 0,
    all: requests?.filter((item) => item.status !== 'archived').length ?? 0,
  }
  const query = search.trim().toLowerCase()
  const visible = (requests ?? [])
    // "All" leaves archived requests out; they have their own tab.
    .filter((item) => (filter === 'all' ? item.status !== 'archived' : item.status === filter))
    .filter((item) => !query || JSON.stringify([item.name, item.phone, item.email, item.service, item.fields]).toLowerCase().includes(query))

  return (
    <div className={`admin-page${view !== 'requests' ? ' admin-page-wide' : ''}`}>
      <header className="admin-top">
        <Link className="brand-block" to="/">
          <BrandMark />
          <div>
            <div className="brand-name">Garage 84</div>
            <small>Admin</small>
          </div>
        </Link>
        <div className="admin-top-actions">
          <button type="button" className="admin-btn" onClick={toggleSound} aria-pressed={soundOn} title={soundOn ? 'Mute the sound for new requests and chats' : 'Play a sound for new requests and chats'}>
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />} {soundOn ? 'Sound on' : 'Sound off'}
          </button>
          <button type="button" className={`admin-btn${alertsOn ? ' admin-btn-primary' : ''}`} onClick={toggleAlerts}>
            {alertsOn ? <Bell size={15} /> : <BellOff size={15} />} {alertsOn ? 'Alerts on' : 'Turn on alerts'}
          </button>
          <NotificationBell
            items={activity.items}
            seenAt={activity.seenAt}
            onOpen={markActivitySeen}
            onSelect={goTo}
            onClear={clearActivity}
          />
          <ThemeToggle />
          <button type="button" className="admin-btn" onClick={logout}><LogOut size={15} /> Sign out</button>
        </div>
      </header>

      {toast && (
        <div className="admin-toast" role="status" key={toast.at}>
          <BellRing size={20} />
          <div>
            <strong>{toast.title}</strong>
            <span>{toast.body}</span>
          </div>
          <button type="button" className="admin-btn admin-btn-primary" onClick={openToast}>View</button>
          <button type="button" className="admin-toast-close" onClick={() => setToast(null)} aria-label="Dismiss"><X size={16} /></button>
        </div>
      )}

      <main className="admin-main">
        <div className="admin-heading">
          <div className="admin-views" role="tablist" aria-label="Admin sections">
            <button type="button" role="tab" aria-selected={view === 'requests'} className={view === 'requests' ? 'active' : ''} onClick={() => setView('requests')}>
              <ClipboardList size={18} /> Requests {newCount > 0 && <span className="admin-count">{newCount}</span>}
            </button>
            <button type="button" role="tab" aria-selected={view === 'chats'} className={view === 'chats' ? 'active' : ''} onClick={() => setView('chats')}>
              <MessagesSquare size={18} /> Chats {unreadChats > 0 && <span className="admin-count">{unreadChats}</span>}
            </button>
            <button type="button" role="tab" aria-selected={view === 'schedule'} className={view === 'schedule' ? 'active' : ''} onClick={() => setView('schedule')}>
              <CalendarDays size={18} /> Schedule
            </button>
            <button type="button" role="tab" aria-selected={view === 'reviews'} className={view === 'reviews' ? 'active' : ''} onClick={() => setView('reviews')}>
              <Star size={18} /> Reviews {pendingReviews > 0 && <span className="admin-count">{pendingReviews}</span>}
            </button>
          </div>
          <div className="admin-heading-side">
            <p>
              {lastChecked ? `Checked ${lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Loading…'}
            </p>
            <button type="button" className="admin-btn" onClick={refresh} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'admin-spin' : undefined} /> Refresh
            </button>
          </div>
        </div>

        {error && (
          <p className="admin-error" role="alert">
            {error} <button type="button" onClick={() => setError('')}>Dismiss</button>
          </p>
        )}

        {view === 'reviews' ? (
          <AdminReviews token={token} reviews={reviews} onChange={setReviews} onError={handleError} />
        ) : view === 'schedule' ? (
          <AdminSchedule token={token} requests={requests} onError={handleError} />
        ) : view === 'chats' ? (
          <AdminChats
            token={token}
            conversations={chats.conversations}
            aiAvailable={chats.aiAvailable}
            selectedId={selectedChat}
            onSelect={setSelectedChat}
            onChanged={refresh}
            onError={handleError}
          />
        ) : (
          <>
            <div className="admin-toolbar">
              <div className="admin-tabs" role="tablist" aria-label="Filter requests">
                {[['new', 'New'], ['handled', 'Handled'], ['all', 'All'], ['archived', 'Archived']].map(([value, label]) => (
                  <button key={value} type="button" role="tab" aria-selected={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>
                    {label} <span>{counts[value]}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="admin-btn"
                onClick={() => downloadCsv(`garage84-requests-${new Date().toISOString().slice(0, 10)}.csv`, requestsToCsv(requests ?? []))}
                disabled={!requests?.length}
                title="Save every request (including archived) as a spreadsheet"
              >
                <Download size={15} /> Download Excel
              </button>
              <input type="search" className="admin-search" placeholder="Search name, phone, vehicle…" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search requests" />
            </div>

            {requests && visible.length === 0 && (
              <div className="admin-empty">
                {filter === 'new' && !query
                  ? 'No new requests. You are all caught up.'
                  : filter === 'archived' && !query
                    ? 'Nothing archived. Archived requests are hidden from the lists but stay saved here.'
                    : 'No requests match this view.'}
              </div>
            )}

            <div className="admin-list">
              {visible.map((request) => (
                <RequestCard key={request.id} request={request} fresh={freshIds.has(request.id)} onStatus={updateStatus} onDelete={deleteRequest} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default AdminPage
