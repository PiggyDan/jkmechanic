// GET    /api/activity  — admin: saved notification history + when it was last read
// POST   /api/activity  — admin: mark everything as read
// DELETE /api/activity  — admin: clear the history
import { redisConfigured, requireAdmin } from './_lib.js'
import { clearActivity, getActivity, markActivitySeen } from './_activity.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (!redisConfigured()) return res.status(503).json({ error: 'Storage is not configured yet.' })

  try {
    if (!['GET', 'POST', 'DELETE'].includes(req.method)) {
      res.setHeader('Allow', 'GET, POST, DELETE')
      return res.status(405).json({ error: 'Method not allowed.' })
    }
    if (!(await requireAdmin(req, res))) return

    if (req.method === 'POST') await markActivitySeen()
    if (req.method === 'DELETE') await clearActivity()
    return res.status(200).json(await getActivity())
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
