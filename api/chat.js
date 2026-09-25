// Visitor side of the website chat.
// POST /api/chat        { conversationId?, text }  — send a message; the AI answers unless Justin has taken over
// POST /api/chat        { conversationId?, contact: { name, phone } }  — "call me back" details from the chat card
// GET  /api/chat?id=... — fetch the conversation (the widget polls this to show Justin's replies)
// The conversation id is a random UUID that only this visitor's browser knows.
import { clientIp, redisConfigured, underRateLimit } from './_lib.js'
import { aiConfigured, askAI } from './_ai.js'
import { addMessage, chatLabel, createConversation, getConversation, getMessages, setContact } from './_chatStore.js'
import { findPhone } from './_phone.js'
import { findQuickAnswer } from '../src/data/quickAnswers.js'
import { notifyStaff } from './_push.js'
import { logActivity } from './_activity.js'

const MAX_CHARS = 1200
const HISTORY_FOR_AI = 20

// Visitor turns become user messages; the AI's and Justin's replies become assistant messages.
function toHistory(messages) {
  const history = messages
    .slice(-HISTORY_FOR_AI)
    .map((message) => ({ role: message.role === 'visitor' ? 'user' : 'assistant', content: message.text }))
  while (history.length && history[0].role !== 'user') history.shift()
  return history
}

function publicView(conversation, messages) {
  return {
    conversationId: conversation.id,
    ai: conversation.ai && aiConfigured(),
    contact: { name: conversation.contactName, phone: conversation.contactPhone },
    messages,
  }
}

async function tellStaff(conversation, text) {
  const who = chatLabel(conversation)
  await logActivity({ type: 'chat', title: `Chat message from ${who}`, body: text, link: { view: 'chats', id: conversation.id } })
  await notifyStaff({ title: `Chat: ${who}`, body: text, path: `/admin/chat/${conversation.id}` })
}

// The "call me back" card: save name + number and add them to the conversation for Justin.
async function saveContact(req, res, body) {
  const name = String(body.contact?.name ?? '').trim().slice(0, 60)
  const phone = findPhone(body.contact?.phone)
  if (!phone) return res.status(400).json({ error: 'Please enter a valid phone number, e.g. 9911 2233 or +976 9911 2233.' })

  let conversation = await getConversation(body.conversationId)
  if (!conversation) conversation = await getConversation(await createConversation())
  await setContact(conversation.id, { name, phone })
  conversation = { ...conversation, contactName: name || conversation.contactName, contactPhone: phone }

  const text = name ? `My name is ${name}. Please call me on ${phone}.` : `Please call me on ${phone}.`
  await addMessage(conversation.id, 'visitor', text)
  await tellStaff(conversation, text)
  return res.status(200).json(publicView(conversation, await getMessages(conversation.id)))
}


async function getChat(req, res) {
  const conversation = await getConversation(req.query.id)
  if (!conversation) return res.status(404).json({ error: 'Conversation not found.' })
  return res.status(200).json(publicView(conversation, await getMessages(conversation.id)))
}

async function postMessage(req, res) {
  const body = req.body && typeof req.body === 'object' ? req.body : {}

  // 30 messages per hour per visitor keeps spam and API costs in check.
  if (!(await underRateLimit('chat', clientIp(req), 30, 3600))) {
    return res.status(429).json({ error: "You've sent a lot of messages. Please call +976 8885 6529 or try again later." })
  }

  if (body.contact) return saveContact(req, res, body)

  const text = String(body.text ?? '').trim().slice(0, MAX_CHARS)
  if (!text) return res.status(400).json({ error: 'Please type a message.' })

  let conversation = await getConversation(body.conversationId)
  if (!conversation) conversation = await getConversation(await createConversation())

  // A number typed anywhere in the chat is saved so Justin can call back.
  const phone = !conversation.contactPhone && findPhone(text)
  if (phone) {
    await setContact(conversation.id, { phone })
    conversation = { ...conversation, contactPhone: phone }
  }

  await addMessage(conversation.id, 'visitor', text)
  await tellStaff(conversation, text)

  let notice = ''
  const quickAnswer = conversation.ai ? findQuickAnswer(text) : null
  if (quickAnswer) {
    // Suggestion buttons get their fixed answer instantly, without calling the AI.
    await addMessage(conversation.id, 'ai', quickAnswer)
  } else if (conversation.ai && aiConfigured()) {
    try {
      const reply = await askAI(toHistory(await getMessages(conversation.id)))
      await addMessage(conversation.id, 'ai', reply)
    } catch (error) {
      // e.g. the free tier's daily limit is used up: the visitor's message is saved and Justin replies.
      console.error('Chat AI error:', error?.status ?? '', error?.message ?? error)
      notice = "The assistant couldn't answer just now. Justin will see your message and reply here."
    }
  }

  return res.status(200).json({ ...publicView(conversation, await getMessages(conversation.id)), notice })
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (!redisConfigured()) {
    return res.status(503).json({ error: 'Chat is not set up yet. Please call +976 8885 6529.' })
  }

  try {
    if (req.method === 'GET') return await getChat(req, res)
    if (req.method === 'POST') return await postMessage(req, res)
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
