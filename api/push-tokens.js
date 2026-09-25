// POST   /api/push-tokens  — admin: { token } register this phone for booking/chat notifications
// DELETE /api/push-tokens  — admin: { token } stop notifications to this phone (on sign-out)
import { redisConfigured, requireAdmin } from './_lib.js'
import { addPushToken, removePushToken } from './_push.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (!redisConfigured()) return res.status(503).json({ error: 'Storage is not configured yet.' })

  try {
    if (!['POST', 'DELETE'].includes(req.method)) {
      res.setHeader('Allow', 'POST, DELETE')
      return res.status(405).json({ error: 'Method not allowed.' })
    }
    if (!(await requireAdmin(req, res))) return

    const token = req.body?.token
    if (req.method === 'POST') {
      try {
        await addPushToken(token)
      } catch {
        return res.status(400).json({ error: 'Invalid push token.' })
      }
    } else {
      await removePushToken(String(token ?? ''))
    }
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
