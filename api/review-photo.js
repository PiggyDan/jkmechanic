// GET /api/review-photo?id=<reviewId>&n=<0..2>
// Photos of published reviews are public (and cached). Photos of reviews waiting for approval
// or hidden are only served to the admin (Authorization header), so they never leak early.
import { isAdmin, redis, redisConfigured } from './_lib.js'
import { MAX_PHOTOS, getPhoto } from './_reviewPhotos.js'

export default async function handler(req, res) {
  if (!redisConfigured()) return res.status(503).json({ error: 'Not available.' })
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    const { id } = req.query
    const n = Number(req.query.n)
    if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/.test(id) || !Number.isInteger(n) || n < 0 || n >= MAX_PHOTOS) {
      return res.status(400).json({ error: 'Invalid photo.' })
    }

    const [value] = await redis(['GET', `jk:review:${id}`])
    const review = value ? JSON.parse(value) : null
    const published = review?.status === 'approved'
    if (!review || (!published && !isAdmin(req))) return res.status(404).json({ error: 'Photo not found.' })

    const photo = await getPhoto(id, n)
    if (!photo) return res.status(404).json({ error: 'Photo not found.' })

    const bytes = Buffer.from(photo.data, 'base64')
    res.setHeader('Content-Type', photo.type)
    res.setHeader('Content-Length', bytes.length)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', published ? 'public, max-age=86400' : 'private, no-store')
    return res.status(200).end(bytes)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Something went wrong.' })
  }
}
