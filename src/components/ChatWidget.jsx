import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MessageCircle, Phone, Send, X } from 'lucide-react'
import { OPEN_CHAT_EVENT } from '../lib/chat'
import { quickAnswers } from '../data/quickAnswers'
import './chat-widget.css'
import BrandMark from './BrandMark'

const ID_KEY = 'jk-chat-id'
const SEEN_KEY = 'jk-chat-seen'
const OPEN_POLL_MS = 4000
const CLOSED_POLL_MS = 30000
const GREETING = "Hi! I'm the Garage 84 assistant, and Justin can also reply here himself. Ask about repairs, parts, storage, directions or booking. Сайн байна уу! Монголоор асууж болно."
const SUGGESTIONS = quickAnswers.map((item) => item.question)

// Links the assistant may produce: internal pages, tel:, mailto:, Messenger and Google Maps.
const LINK_PATTERN = /\[([^\]]+)\]\(((?:\/(?!\/)|tel:|mailto:|https:\/\/m\.me\/|https:\/\/www\.google\.com\/maps\/)[^)\s]*)\)/g

function renderText(text, onNavigate) {
  const parts = []
  let last = 0
  for (const match of text.matchAll(LINK_PATTERN)) {
    parts.push(text.slice(last, match.index))
    const [, label, href] = match
    parts.push(
      href.startsWith('/')
        ? <Link key={match.index} to={href} onClick={onNavigate}>{label}</Link>
        : <a key={match.index} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{label}</a>,
    )
    last = match.index + match[0].length
  }
  parts.push(text.slice(last))
  return parts
}

const storage = {
  get: (key) => { try { return localStorage.getItem(key) } catch { return null } },
  set: (key, value) => {
    try {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    } catch { /* Storage may be disabled; the chat then lasts until reload. */ }
  },
}

// Replies from the garage side (AI or Justin) — used for the unread badge.
const countReplies = (messages) => messages.filter((message) => message.role !== 'visitor').length

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [conversationId, setConversationId] = useState(() => storage.get(ID_KEY))
  const [messages, setMessages] = useState([])
  const [ai, setAi] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [contact, setContact] = useState({ name: '', phone: '' })
  const [callback, setCallback] = useState({ name: '', phone: '', saving: false, error: '', dismissed: false })
  const [seen, setSeen] = useState(() => Number(storage.get(SEEN_KEY) || 0))
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const location = useLocation()

  const applyConversation = useCallback((data) => {
    setMessages(data.messages)
    setAi(data.ai)
    if (data.contact) setContact(data.contact)
    if (data.conversationId) {
      setConversationId(data.conversationId)
      storage.set(ID_KEY, data.conversationId)
    }
  }, [])

  const forget = useCallback(() => {
    storage.set(ID_KEY, null)
    storage.set(SEEN_KEY, null)
    setConversationId(null)
    setMessages([])
    setSeen(0)
    setContact({ name: '', phone: '' })
    setCallback({ name: '', phone: '', saving: false, error: '', dismissed: false })
  }, [])

  const load = useCallback(async () => {
    if (!conversationId) return
    try {
      const response = await fetch(`/api/chat?id=${encodeURIComponent(conversationId)}`)
      if (response.status === 404) return forget()
      if (response.ok) applyConversation(await response.json())
    } catch {
      // Offline; the next poll tries again.
    }
  }, [conversationId, applyConversation, forget])

  // The installed app's "Chat with Justin" shortcut opens /?chat=1.
  useEffect(() => {
    if (new URLSearchParams(location.search).get('chat') === '1') setOpen(true)  
  }, [location.search])

  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener(OPEN_CHAT_EVENT, handleOpen)
    return () => window.removeEventListener(OPEN_CHAT_EVENT, handleOpen)
  }, [])

  // Poll for Justin's replies: every few seconds while open, occasionally while closed.
  useEffect(() => {
    if (!conversationId) return undefined
    load()  
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, open ? OPEN_POLL_MS : CLOSED_POLL_MS)
    return () => clearInterval(timer)
  }, [conversationId, open, load])

  // Everything on screen counts as read while the panel is open.
  const replies = countReplies(messages)
  useEffect(() => {
    if (open && replies !== seen) {
      storage.set(SEEN_KEY, String(replies))
      setSeen(replies)  
    }
  }, [open, replies, seen])

  useEffect(() => {
    if (open) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [open, messages.length, sending])

  useEffect(() => {
    if (!open) return undefined
    const handleKey = (event) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  if (location.pathname.startsWith('/admin')) return null

  const unread = Math.max(replies - seen, 0)

  const send = async (text) => {
    const content = text.trim()
    if (!content || sending) return
    setMessages((current) => [...current, { id: `local-${Date.now()}`, role: 'visitor', text: content, at: Date.now() }])
    setInput('')
    setError('')
    setNotice('')
    setSending(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, text: content }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Your message could not be sent. Please try again.')
      applyConversation(data)
      setNotice(data.notice || '')
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'No connection. Check your internet and try again.' : err.message)
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    send(input)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send(input)
    }
  }

  const reset = () => {
    forget()
    setError('')
    setNotice('')
  }

  // "Call me back" card: shown when no AI is answering (it asks for the number itself otherwise).
  const saveCallback = async (event) => {
    event.preventDefault()
    setCallback((current) => ({ ...current, saving: true, error: '' }))
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, contact: { name: callback.name, phone: callback.phone } }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not save your number. Please try again.')
      applyConversation(data)
      setCallback((current) => ({ ...current, saving: false }))
    } catch (err) {
      setCallback((current) => ({ ...current, saving: false, error: err.message }))
    }
  }

  const firstAdminIndex = messages.findIndex((message) => message.role === 'admin')
  const humanMode = !ai || firstAdminIndex !== -1
  const waitingForJustin = !ai && !sending && messages.at(-1)?.role === 'visitor'
  const hasVisitorMessage = messages.some((message) => message.role === 'visitor')
  const showCallback = hasVisitorMessage && !contact.phone && !callback.dismissed && !sending && (!ai || Boolean(notice))

  return (
    <>
      {!open && (
        <button type="button" className="chat-launcher" onClick={() => setOpen(true)} aria-label={unread ? `Chat — ${unread} new ${unread === 1 ? 'reply' : 'replies'}` : 'Chat with Garage 84'}>
          <MessageCircle size={24} />
          {unread > 0 && <span className="chat-launcher-badge">{unread}</span>}
        </button>
      )}

      {open && (
        <section className="chat-panel" role="dialog" aria-label="Garage 84 chat">
          <header className="chat-head">
            <BrandMark />
            <div>
              <strong>Garage 84</strong>
              <small>{humanMode ? 'Chatting with Justin' : 'AI assistant · Justin can join'}</small>
            </div>
            {messages.length > 0 && <button type="button" className="chat-reset" onClick={reset}>New chat</button>}
            <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
          </header>

          <div className="chat-list" ref={listRef} aria-live="polite">
            <p className="chat-msg chat-msg-assistant">{GREETING}</p>
            {messages.map((message, index) => (
              <div key={message.id} className="chat-row">
                {index === firstAdminIndex && <p className="chat-divider">Justin joined the chat</p>}
                {message.role === 'admin' && <span className="chat-author">Justin · JK Mechanic</span>}
                <p className={`chat-msg ${message.role === 'visitor' ? 'chat-msg-user' : 'chat-msg-assistant'}${message.role === 'admin' ? ' chat-msg-admin' : ''}`}>
                  {message.role === 'visitor' ? message.text : renderText(message.text, () => setOpen(false))}
                </p>
              </div>
            ))}
            {sending && ai && <p className="chat-msg chat-msg-assistant chat-typing" aria-label="Assistant is typing"><span /><span /><span /></p>}
            {waitingForJustin && (
              <p className="chat-note">Justin will reply here. You can close this window and come back — your chat is saved on this device.</p>
            )}
            {notice && <p className="chat-note">{notice}</p>}
            {showCallback && (
              <form className="chat-callback" onSubmit={saveCallback}>
                <strong><Phone size={15} aria-hidden="true" /> Want Justin to call you back?</strong>
                <input
                  value={callback.name}
                  onChange={(event) => setCallback((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                  autoComplete="name"
                  maxLength={60}
                  aria-label="Your name"
                />
                <input
                  type="tel"
                  value={callback.phone}
                  onChange={(event) => setCallback((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="Phone, e.g. 9911 2233"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  aria-label="Your phone number"
                />
                {callback.error && <span className="chat-callback-error" role="alert">{callback.error}</span>}
                <div className="chat-callback-actions">
                  <button type="submit" disabled={callback.saving || !callback.phone.trim()}>{callback.saving ? 'Saving…' : 'Call me back'}</button>
                  <button type="button" className="chat-callback-skip" onClick={() => setCallback((current) => ({ ...current, dismissed: true }))}>No thanks</button>
                </div>
              </form>
            )}
            {contact.phone && hasVisitorMessage && (
              <p className="chat-note chat-note-ok">
                <Phone size={13} aria-hidden="true" /> Justin can call you on <strong>{contact.phone}</strong>
              </p>
            )}
            {error && <p className="chat-error" role="alert">{error}</p>}
            {messages.length === 0 && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => send(suggestion)}>{suggestion}</button>
                ))}
              </div>
            )}
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…"
              maxLength={1200}
              aria-label="Your message"
            />
            <button type="submit" disabled={!input.trim() || sending} aria-label="Send"><Send size={18} /></button>
          </form>
          <p className="chat-foot">
            {humanMode ? 'Replies come from Justin at Garage 84.' : 'AI can make mistakes.'} Urgent? Call <a href="tel:+97688856529">+976 8885 6529</a>.
          </p>
        </section>
      )}
    </>
  )
}
