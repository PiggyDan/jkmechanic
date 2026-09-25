// Storage for website chat conversations.
// jk:chat:<id>    hash  createdAt, updatedAt, ai ('1' AI replies / '0' Justin handles it), unread, last, lastRole,
//                       contactName, contactPhone (so Justin can call the visitor back)
// jk:chat:<id>:m  list  JSON messages { id, role: 'visitor' | 'ai' | 'admin', text, at }
// jk:chats        zset  conversation ids scored by last activity
// Conversations are kept until deleted in the admin (no automatic expiry).
import { randomUUID } from 'node:crypto'
import { redis } from './_lib.js'

const INDEX = 'jk:chats'
const MAX_MESSAGES = 200

const metaKey = (id) => `jk:chat:${id}`
const messagesKey = (id) => `jk:chat:${id}:m`

export const isChatId = (id) => typeof id === 'string' && /^[0-9a-f-]{36}$/.test(id)

function parseMeta(id, flat) {
  if (!flat?.length) return null
  const meta = {}
  for (let i = 0; i < flat.length; i += 2) meta[flat[i]] = flat[i + 1]
  return {
    id,
    createdAt: Number(meta.createdAt),
    updatedAt: Number(meta.updatedAt),
    ai: meta.ai !== '0',
    unread: Number(meta.unread || 0),
    last: meta.last || '',
    lastRole: meta.lastRole || '',
    contactName: meta.contactName || '',
    contactPhone: meta.contactPhone || '',
  }
}

// How the visitor is shown to staff: their name or number once known, otherwise "Visitor ABCD".
export const chatLabel = (conversation) =>
  conversation.contactName || conversation.contactPhone || `Visitor ${conversation.id.slice(0, 4).toUpperCase()}`

export async function createConversation() {
  const id = randomUUID()
  const now = Date.now()
  await redis(['HSET', metaKey(id), 'createdAt', now, 'updatedAt', now, 'ai', '1', 'unread', 0])
  return id
}

export async function getConversation(id) {
  if (!isChatId(id)) return null
  const [flat] = await redis(['HGETALL', metaKey(id)])
  return parseMeta(id, flat)
}

export async function getMessages(id) {
  const [items] = await redis(['LRANGE', messagesKey(id), 0, -1])
  return items.map((item) => JSON.parse(item))
}

export async function addMessage(id, role, text) {
  const message = { id: randomUUID().slice(0, 8), role, text, at: Date.now() }
  await redis(
    ['RPUSH', messagesKey(id), JSON.stringify(message)],
    ['LTRIM', messagesKey(id), -MAX_MESSAGES, -1],
    ['HSET', metaKey(id), 'updatedAt', message.at, 'last', text.slice(0, 160), 'lastRole', role],
    ...(role === 'visitor' ? [['HINCRBY', metaKey(id), 'unread', 1]] : []),
    ['ZADD', INDEX, message.at, id],
  )
  return message
}

export async function setContact(id, { name, phone }) {
  const fields = [...(name ? ['contactName', name] : []), ...(phone ? ['contactPhone', phone] : [])]
  if (fields.length) await redis(['HSET', metaKey(id), ...fields])
}

export async function setAi(id, enabled) {
  await redis(['HSET', metaKey(id), 'ai', enabled ? '1' : '0'])
}

export async function markRead(id) {
  await redis(['HSET', metaKey(id), 'unread', 0])
}

export async function listConversations(limit = 100) {
  const [ids] = await redis(['ZRANGE', INDEX, 0, limit - 1, 'REV'])
  if (!ids.length) return []
  const results = await redis(...ids.map((id) => ['HGETALL', metaKey(id)]))
  const expired = ids.filter((_, index) => !results[index]?.length)
  if (expired.length) await redis(['ZREM', INDEX, ...expired])
  return ids.map((id, index) => parseMeta(id, results[index])).filter(Boolean)
}

export async function deleteConversation(id) {
  await redis(['DEL', metaKey(id), messagesKey(id)], ['ZREM', INDEX, id])
}
