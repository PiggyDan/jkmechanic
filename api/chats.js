// Admin side of the website chat (requires the admin password).
// GET    /api/chats           — list conversations, newest activity first
// GET    /api/chats?id=...    — one conversation with its messages (marks it read)
// POST   /api/chats           — { id, text }: reply as Justin (turns AI off for that chat)
// PATCH  /api/chats           — { id, ai: boolean }: hand the chat back to the AI or take it over
// DELETE /api/chats?id=...    — delete a conversation
import { redisConfigured, requireAdmin } from './_lib.js'
import {
  addMessage, deleteConversation, getConversation, getMessages, isChatId, listConversations, markRead, setAi,
} from './_chatStore.js'

const MAX_CHARS = 2000

async function findConversation(id, res) {
  const conversation = await getConversation(id)
  if (!conversation) res.status(404).json({ error: 'Conversation not found.' })
  return conversation
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (!redisConfigured()) return res.status(503).json({ error: 'Storage is not configured yet.' })

  try {
    if (!(await requireAdmin(req, res))) return

    if (req.method === 'GET' && !req.query.id) {
      const conversations = await listConversations()
      return res.status(200).json({
        conversations,
        aiAvailable: Boolean(process.env.ANTHROPIC_API_KEY),
      })
    }

    if (req.method === 'GET') {
      const conversation = await findConversation(req.query.id, res)
      if (!conversation) return
      if (conversation.unread) await markRead(conversation.id)
      return res.status(200).json({ conversation: { ...conversation, unread: 0 }, messages: await getMessages(conversation.id) })
    }

    if (req.method === 'POST') {
      const text = String(req.body?.text ?? '').trim().slice(0, MAX_CHARS)
      if (!text) return res.status(400).json({ error: 'Type a reply first.' })
      const conversation = await findConversation(req.body?.id, res)
      if (!conversation) return
      await addMessage(conversation.id, 'admin', text)
      await setAi(conversation.id, false)
      return res.status(200).json({ conversation: { ...conversation, ai: false }, messages: await getMessages(conversation.id) })
    }

    if (req.method === 'PATCH') {
      const { id, ai } = req.body || {}
      if (!isChatId(id) || typeof ai !== 'boolean') return res.status(400).json({ error: 'Invalid update.' })
      const conversation = await findConversation(id, res)
      if (!conversation) return
      await setAi(id, ai)
      return res.status(200).json({ conversation: { ...conversation, ai } })
    }

    if (req.method === 'DELETE') {
      if (!isChatId(req.query.id)) return res.status(400).json({ error: 'Missing id.' })
      await deleteConversation(req.query.id)
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
