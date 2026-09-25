import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Bot, Phone, Send, Trash2, UserRound } from 'lucide-react'
import { adminApi, chatLabel, timeAgo, timeFormat } from './adminApi'

const THREAD_POLL_MS = 4000
const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`
// Chat answers contain [label](link) markup; show just the label here.
const plainText = (text) => text.replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')

function Thread({ token, id, aiAvailable, onBack, onChanged, onError }) {
  const [thread, setThread] = useState(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)

  const load = useCallback(async () => {
    try {
      setThread(await adminApi(token, 'chats', 'GET', { query: `?id=${encodeURIComponent(id)}` }))
    } catch (err) {
      onError(err)
    }
  }, [token, id, onError])

  // Opening a chat marks it read; keep polling so new visitor messages appear live.
  useEffect(() => {
    load() // eslint-disable-line react-hooks/set-state-in-effect -- state updates happen after the fetch resolves
    onChanged()
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, THREAD_POLL_MS)
    return () => clearInterval(timer)
  }, [load, onChanged])

  const messageCount = thread?.messages.length ?? 0
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messageCount])

  const send = async (event) => {
    event.preventDefault()
    const text = reply.trim()
    if (!text || sending) return
    setSending(true)
    try {
      setThread(await adminApi(token, 'chats', 'POST', { body: { id, text } }))
      setReply('')
      onChanged()
    } catch (err) {
      onError(err)
    } finally {
      setSending(false)
    }
  }

  const toggleAi = async () => {
    const ai = !thread.conversation.ai
    try {
      const data = await adminApi(token, 'chats', 'PATCH', { body: { id, ai } })
      setThread((current) => ({ ...current, conversation: data.conversation }))
      onChanged()
    } catch (err) {
      onError(err)
    }
  }

  const remove = async () => {
    if (!window.confirm('Delete this conversation? The visitor will no longer see it either.')) return
    try {
      await adminApi(token, 'chats', 'DELETE', { query: `?id=${encodeURIComponent(id)}` })
      onBack()
      onChanged()
    } catch (err) {
      onError(err)
    }
  }

  if (!thread) return <div className="admin-thread admin-thread-empty">Loading…</div>

  const { conversation, messages } = thread
  return (
    <div className="admin-thread">
      <header className="admin-thread-head">
        <button type="button" className="admin-btn admin-thread-back" onClick={onBack} aria-label="Back to chats"><ArrowLeft size={15} /></button>
        <div>
          <strong>{chatLabel(conversation)}</strong>
          <small>
            {conversation.contactPhone ? `${conversation.contactPhone} · ` : 'No phone number yet · '}
            Started {timeFormat.format(conversation.createdAt)}
          </small>
        </div>
        {conversation.contactPhone && (
          <a className="admin-btn admin-btn-primary" href={telHref(conversation.contactPhone)}>
            <Phone size={15} /> Call
          </a>
        )}
        {aiAvailable && (
          <label className="admin-switch" title="When on, the AI answers this visitor automatically">
            <input type="checkbox" checked={conversation.ai} onChange={toggleAi} />
            <span aria-hidden="true" />
            AI auto-reply
          </label>
        )}
        <button type="button" className="admin-btn admin-btn-danger" onClick={remove} aria-label="Delete conversation"><Trash2 size={15} /></button>
      </header>

      <div className="admin-thread-list" ref={listRef}>
        {messages.map((message) => (
          <div key={message.id} className={`admin-bubble admin-bubble-${message.role}`}>
            <span className="admin-bubble-meta">
              {message.role === 'visitor' ? <UserRound size={12} /> : message.role === 'ai' ? <Bot size={12} /> : null}
              {message.role === 'visitor' ? 'Visitor' : message.role === 'ai' ? 'AI assistant' : 'You'} · {timeAgo(message.at)}
            </span>
            <p>{plainText(message.text)}</p>
          </div>
        ))}
      </div>

      <form className="admin-reply" onSubmit={send}>
        <textarea
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) send(event)
          }}
          placeholder="Reply as Justin…"
          rows={2}
          maxLength={2000}
          aria-label="Your reply"
        />
        <button type="submit" className="admin-btn admin-btn-primary" disabled={!reply.trim() || sending}>
          <Send size={15} /> {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
      <p className="admin-reply-hint">
        {conversation.ai && aiAvailable
          ? 'Sending a reply turns AI auto-reply off, so the visitor talks to you.'
          : 'You are handling this chat. The visitor sees your replies within a few seconds.'}
      </p>
    </div>
  )
}

export default function AdminChats({ token, conversations, aiAvailable, selectedId, onSelect, onChanged, onError }) {
  const back = useCallback(() => onSelect(null), [onSelect])

  if (!conversations.length) {
    return <div className="admin-empty">No chats yet. When a visitor uses the chat on the website, it appears here.</div>
  }

  return (
    <div className={`admin-chats${selectedId ? ' has-selection' : ''}`}>
      <ul className="admin-chat-list">
        {conversations.map((chat) => (
          <li key={chat.id}>
            <button type="button" className={`admin-chat-item${chat.id === selectedId ? ' active' : ''}${chat.unread ? ' unread' : ''}`} onClick={() => onSelect(chat.id)}>
              <span className="admin-chat-top">
                <strong>{chatLabel(chat)}</strong>
                <time dateTime={new Date(chat.updatedAt).toISOString()}>{timeAgo(chat.updatedAt)}</time>
              </span>
              {chat.contactPhone && chat.contactName && (
                <span className="admin-chat-phone"><Phone size={12} aria-hidden="true" /> {chat.contactPhone}</span>
              )}
              <span className="admin-chat-preview">
                {chat.lastRole === 'admin' ? 'You: ' : chat.lastRole === 'ai' ? 'AI: ' : ''}{chat.last}
              </span>
              <span className="admin-chat-tags">
                {chat.unread > 0 && <span className="admin-badge">{chat.unread} new</span>}
                <span className="admin-chat-mode">{chat.ai && aiAvailable ? 'AI replying' : 'Handled by you'}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {selectedId ? (
        <Thread key={selectedId} token={token} id={selectedId} aiAvailable={aiAvailable} onBack={back} onChanged={onChanged} onError={onError} />
      ) : (
        <div className="admin-thread admin-thread-empty">Choose a chat to read it and reply.</div>
      )}
    </div>
  )
}
