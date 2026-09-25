// POST   /api/requests          — public: save a booking/contact request (optional appointment: { date, time })
// GET    /api/requests          — admin: list the latest requests
// PATCH  /api/requests          — admin: { id, status } — a workshop stage from src/data/requestStatus.js (archived = hidden but kept)
// DELETE /api/requests?id=...   — admin: remove a request
import { randomUUID } from 'node:crypto'
import { KEYS, clientIp, redis, redisConfigured, requireAdmin, sendEmailCopy, underRateLimit } from './_lib.js'
import { getBlocked } from './_availability.js'
import { notifyStaff } from './_push.js'
import { logActivity } from './_activity.js'
import { appointmentProblem } from '../src/data/schedule.js'
import { STATUS_VALUES, normalizeStatus } from '../src/data/requestStatus.js'

const MAX_LIST = 1000

const text = (value, max) => String(value ?? '').trim().slice(0, max)

function parseSubmission(body) {
  const fields = Array.isArray(body.fields) ? body.fields.slice(0, 20) : []
  return {
    name: text(body.name, 120),
    phone: text(body.phone, 40),
    email: text(body.email, 200),
    service: text(body.service, 120),
    source: text(body.source, 80),
    fields: fields
      .map((field) => ({ label: text(field?.label, 80), value: text(field?.value, 3000) }))
      .filter((field) => field.label && field.value),
  }
}

async function createRequest(req, res) {
  const body = req.body && typeof req.body === 'object' ? req.body : {}

  // Honeypot: real visitors never see or fill the "website" field.
  if (body.website) return res.status(200).json({ ok: true })

  const submission = parseSubmission(body)
  if (!submission.name || !submission.phone) {
    return res.status(400).json({ error: 'Please add your name and phone number.' })
  }

  if (!(await underRateLimit('submit', clientIp(req), 8, 3600))) {
    return res.status(429).json({ error: 'Too many requests. Please call us instead.' })
  }

  // Re-check the chosen time against the admin's schedule; it may have filled up since the page loaded.
  let appointment
  if (body.appointment) {
    appointment = { date: text(body.appointment.date, 10), time: text(body.appointment.time, 5) }
    const problem = appointmentProblem(appointment, await getBlocked())
    if (problem) return res.status(409).json({ error: problem, field: 'appointment' })
  }

  const entry = { id: randomUUID(), createdAt: Date.now(), status: 'new', ...submission, ...(appointment && { appointment }) }
  await redis(
    ['SET', KEYS.request(entry.id), JSON.stringify(entry)],
    ['ZADD', KEYS.index, entry.createdAt, entry.id],
  )

  try {
    await sendEmailCopy(entry)
  } catch (error) {
    console.error('Email copy failed:', error)
  }
  await logActivity({
    type: 'request',
    title: `New request from ${entry.name}`,
    body: `${entry.service || 'General enquiry'}${appointment ? ` · ${appointment.date} ${appointment.time}` : ''} · ${entry.phone}`,
    link: { view: 'requests' },
  })
  await notifyStaff({
    title: `New request: ${entry.service || 'General enquiry'}`,
    body: `${entry.name} · ${entry.phone}${appointment ? ` · ${appointment.date} ${appointment.time}` : ''}`,
    path: '/admin/requests',
  })

  return res.status(201).json({ ok: true })
}

async function listRequests(res) {
  const [ids] = await redis(['ZRANGE', KEYS.index, 0, MAX_LIST - 1, 'REV'])
  if (!ids.length) return res.status(200).json({ requests: [] })

  const [values] = await redis(['MGET', ...ids.map(KEYS.request)])
  // Older requests used "handled"; they are listed as Done.
  const requests = values.filter(Boolean).map((value) => {
    const request = JSON.parse(value)
    return { ...request, status: normalizeStatus(request.status) }
  })
  return res.status(200).json({ requests })
}

async function updateRequest(req, res) {
  const { id, status } = req.body || {}
  if (typeof id !== 'string' || !STATUS_VALUES.includes(status)) {
    return res.status(400).json({ error: 'Invalid update.' })
  }

  const [value] = await redis(['GET', KEYS.request(id)])
  if (!value) return res.status(404).json({ error: 'Request not found.' })

  const entry = { ...JSON.parse(value), status, statusAt: Date.now() }
  await redis(['SET', KEYS.request(id), JSON.stringify(entry)])
  return res.status(200).json({ request: entry })
}

async function deleteRequest(req, res) {
  const { id } = req.query
  if (typeof id !== 'string' || !id) return res.status(400).json({ error: 'Missing id.' })

  await redis(['DEL', KEYS.request(id)], ['ZREM', KEYS.index, id])
  return res.status(200).json({ ok: true })
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (!redisConfigured()) {
    return res.status(503).json({ error: 'Storage is not configured yet.' })
  }

  try {
    if (req.method === 'POST') return await createRequest(req, res)

    if (!['GET', 'PATCH', 'DELETE'].includes(req.method)) {
      res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
      return res.status(405).json({ error: 'Method not allowed.' })
    }

    if (!(await requireAdmin(req, res))) return

    if (req.method === 'GET') return await listRequests(res)
    if (req.method === 'PATCH') return await updateRequest(req, res)
    return await deleteRequest(req, res)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
