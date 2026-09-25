// Shared helpers for the Vercel functions in /api.
// Files starting with "_" are not deployed as endpoints.
import { createHash, timingSafeEqual } from 'node:crypto'

// Vercel's Upstash integration sets KV_REST_API_*; a direct Upstash setup uses UPSTASH_REDIS_REST_*.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

export const KEYS = {
  index: 'jk:requests',
  request: (id) => `jk:req:${id}`,
  rate: (bucket, ip) => `jk:rl:${bucket}:${ip}`,
}

// Set by the Vite dev server (vite.config.js); never set on Vercel.
const LOCAL_DEV = process.env.JK_LOCAL_DEV === '1'
const inMemory = () => LOCAL_DEV && !(REDIS_URL && REDIS_TOKEN)

export function redisConfigured() {
  return Boolean(REDIS_URL && REDIS_TOKEN) || LOCAL_DEV
}

// Runs several Redis commands in one round trip via Upstash's REST pipeline.
export async function redis(...commands) {
  if (inMemory()) {
    const { memoryRedis } = await import('./_memoryRedis.js')
    return memoryRedis(commands)
  }
  const response = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!response.ok) throw new Error(`Redis HTTP ${response.status}`)
  const results = await response.json()
  const failed = results.find((item) => item.error)
  if (failed) throw new Error(`Redis error: ${failed.error}`)
  return results.map((item) => item.result)
}

export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  return (Array.isArray(forwarded) ? forwarded[0] : forwarded || '').split(',')[0].trim() || 'unknown'
}

// Fixed-window limiter: returns true while the caller is under `limit` hits per `windowSeconds`.
export async function underRateLimit(bucket, ip, limit, windowSeconds) {
  const key = KEYS.rate(bucket, ip)
  const [, count] = await redis(['SET', key, 0, 'EX', windowSeconds, 'NX'], ['INCR', key])
  return count <= limit
}

const digest = (value) => createHash('sha256').update(String(value)).digest()

export function isAdmin(req) {
  const password = process.env.ADMIN_PASSWORD
  const header = req.headers.authorization || ''
  if (!password || !header.startsWith('Bearer ')) return false
  return timingSafeEqual(digest(header.slice(7)), digest(password))
}

// Sends 401/429 and returns false unless the request carries the admin password.
// Failed attempts are limited to 10 per 15 minutes per IP to slow down guessing.
export async function requireAdmin(req, res) {
  if (isAdmin(req)) return true
  const allowed = await underRateLimit('login', clientIp(req), 10, 900)
  res.status(allowed ? 401 : 429).json({
    error: allowed ? 'Wrong password.' : 'Too many attempts. Try again in 15 minutes.',
  })
  return false
}

export const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

// Optional email copy of each request. Skipped when Resend is not configured, and in local dev.
export async function sendEmailCopy(entry) {
  if (LOCAL_DEV) return
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM
  if (!apiKey || !from) return

  const rows = [
    ['Name', entry.name],
    ['Phone', entry.phone],
    ['Email', entry.email || '—'],
    ['Service', entry.service || '—'],
    ...(entry.appointment ? [['Appointment', `${entry.appointment.date} ${entry.appointment.time}`]] : []),
    ...entry.fields.map((field) => [field.label, field.value || '—']),
  ]
    .map(([label, value]) => `<tr><td style="padding:6px 16px 6px 0;color:#777;vertical-align:top">${escapeHtml(label)}</td><td style="white-space:pre-wrap">${escapeHtml(value)}</td></tr>`)
    .join('')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [process.env.NOTIFY_EMAIL || 'jkmechanic@gmail.com'],
      reply_to: entry.email || undefined,
      subject: `New request — ${entry.service || 'Website'} — ${entry.name}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px"><h2>New request from the website</h2><table>${rows}</table></div>`,
    }),
  })
  if (!response.ok) console.error('Resend error:', await response.text())
}
