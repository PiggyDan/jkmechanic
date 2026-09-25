// GET /api/availability — public: which days/times can't be booked (admin blocks + customers' bookings)
//                         plus `adminBlocked` (only the admin's own blocks, for the Schedule tab)
// PUT /api/availability — admin: { date, all: boolean, slots: ['10:00', ...] } marks a day or slots as full
import { redisConfigured, requireAdmin } from './_lib.js'
import { getBlocked, getBooked, mergeUnavailable, setBlocked } from './_availability.js'
import { garageNow, isDateKey } from '../src/data/schedule.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (!redisConfigured()) return res.status(503).json({ error: 'Storage is not configured yet.' })

  try {
    const view = async () => {
      const [adminBlocked, booked] = await Promise.all([getBlocked(), getBooked()])
      return { blocked: mergeUnavailable(adminBlocked, booked), adminBlocked, now: garageNow() }
    }

    if (req.method === 'GET') return res.status(200).json(await view())

    if (req.method === 'PUT') {
      if (!(await requireAdmin(req, res))) return
      const { date, all, slots } = req.body || {}
      if (!isDateKey(date) || typeof all !== 'boolean' || (slots !== undefined && !Array.isArray(slots))) {
        return res.status(400).json({ error: 'Invalid update.' })
      }
      await setBlocked(date, { all, slots })
      return res.status(200).json(await view())
    }

    res.setHeader('Allow', 'GET, PUT')
    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
