// Saved notification history for the admin bell: new bookings, chat messages and reviews.
// jk:activity       list    newest-first JSON items { id, type, title, body, link, at }
// jk:activity:seen  string  timestamp of when the admin last opened the bell
import { randomUUID } from 'node:crypto'
import { redis } from './_lib.js'

const KEY = 'jk:activity'
const SEEN_KEY = 'jk:activity:seen'
const MAX_ITEMS = 300

// Best effort: a failed log entry never breaks the booking/chat/review that caused it.
// `link` tells the admin page where to go: { view: 'requests' | 'chats' | 'reviews', id? }
export async function logActivity({ type, title, body = '', link }) {
  try {
    const item = { id: randomUUID().slice(0, 8), type, title, body: body.slice(0, 200), link, at: Date.now() }
    await redis(['LPUSH', KEY, JSON.stringify(item)], ['LTRIM', KEY, 0, MAX_ITEMS - 1])
  } catch (error) {
    console.error('Activity log failed:', error)
  }
}

export async function getActivity(limit = 100) {
  const [items, seen] = await redis(['LRANGE', KEY, 0, limit - 1], ['GET', SEEN_KEY])
  return { items: items.map((item) => JSON.parse(item)), seenAt: Number(seen || 0) }
}

export async function markActivitySeen(at = Date.now()) {
  await redis(['SET', SEEN_KEY, at])
}

export async function clearActivity() {
  await redis(['DEL', KEY])
}
