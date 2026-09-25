// Customer reviews written on the website. New reviews wait for the admin's approval.
// GET    /api/reviews             — public: approved reviews + average rating
// GET    /api/reviews?all=1       — admin: every review (pending, approved, hidden)
// POST   /api/reviews             — public: { name, rating 1–5, text, vehicle?, photos?: [dataURL] (max 3) } → saved as pending
// PATCH  /api/reviews             — admin: { id, status: 'approved' | 'hidden' | 'pending' }
// DELETE /api/reviews?id=...      — admin: remove a review
//
// jk:review:<id>  string  JSON review
// jk:reviews      zset    review ids by creation time
import { randomUUID } from 'node:crypto'
import { clientIp, redis, redisConfigured, requireAdmin, underRateLimit } from './_lib.js'
import { logActivity } from './_activity.js'
import { notifyStaff } from './_push.js'
import { deletePhotos, parsePhotos, savePhotos } from './_reviewPhotos.js'

const INDEX = 'jk:reviews'
const reviewKey = (id) => `jk:review:${id}`
const STATUSES = ['pending', 'approved', 'hidden']
const text = (value, max) => String(value ?? '').trim().slice(0, max)

async function allReviews() {
  const [ids] = await redis(['ZRANGE', INDEX, 0, 499, 'REV'])
  if (!ids.length) return []
  const [values] = await redis(['MGET', ...ids.map(reviewKey)])
  return values.filter(Boolean).map((value) => JSON.parse(value))
}

// What visitors see: approved reviews only, without anything private.
function publicView(reviews) {
  const approved = reviews.filter((review) => review.status === 'approved')
  const average = approved.length ? approved.reduce((sum, review) => sum + review.rating, 0) / approved.length : null
  return {
    reviews: approved
      .slice(0, 50)
      .map(({ id, name, rating, text: body, vehicle, createdAt, photos = 0 }) => ({ id, name, rating, text: body, vehicle, createdAt, photos })),
    count: approved.length,
    average: average && Math.round(average * 10) / 10,
  }
}

async function createReview(req, res) {
  const body = req.body && typeof req.body === 'object' ? req.body : {}
  if (body.website) return res.status(201).json({ ok: true }) // honeypot

  const review = {
    name: text(body.name, 60),
    rating: Number(body.rating),
    text: text(body.text, 1500),
    vehicle: text(body.vehicle, 80),
  }
  if (!review.name) return res.status(400).json({ error: 'Please add your name.' })
  if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
    return res.status(400).json({ error: 'Please choose a rating from 1 to 5 stars.' })
  }
  if (review.text.length < 10) return res.status(400).json({ error: 'Please write a few words about your experience.' })

  let photos
  try {
    photos = parsePhotos(body.photos)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }

  if (!(await underRateLimit('review', clientIp(req), 3, 86400))) {
    return res.status(429).json({ error: 'Thanks! You have already sent a few reviews today.' })
  }

  const entry = { id: randomUUID(), createdAt: Date.now(), status: 'pending', ...review, photos: photos.length }
  await savePhotos(entry.id, photos)
  await redis(['SET', reviewKey(entry.id), JSON.stringify(entry)], ['ZADD', INDEX, entry.createdAt, entry.id])

  const stars = '★'.repeat(entry.rating)
  const withPhotos = entry.photos ? ` (${entry.photos} photo${entry.photos > 1 ? 's' : ''})` : ''
  await logActivity({ type: 'review', title: `New review ${stars} from ${entry.name}${withPhotos}`, body: entry.text, link: { view: 'reviews' } })
  await notifyStaff({ title: `New review ${stars}`, body: `${entry.name}: ${entry.text}`, path: '/admin' })
  return res.status(201).json({ ok: true })
}

async function updateReview(req, res) {
  const { id, status } = req.body || {}
  if (typeof id !== 'string' || !STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid update.' })
  const [value] = await redis(['GET', reviewKey(id)])
  if (!value) return res.status(404).json({ error: 'Review not found.' })
  const review = { ...JSON.parse(value), status }
  await redis(['SET', reviewKey(id), JSON.stringify(review)])
  return res.status(200).json({ review })
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (!redisConfigured()) return res.status(503).json({ error: 'Reviews are not available right now.' })

  try {
    if (req.method === 'POST') return await createReview(req, res)

    if (req.method === 'GET' && !req.query.all) return res.status(200).json(publicView(await allReviews()))

    if (!['GET', 'PATCH', 'DELETE'].includes(req.method)) {
      res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
      return res.status(405).json({ error: 'Method not allowed.' })
    }
    if (!(await requireAdmin(req, res))) return

    if (req.method === 'GET') return res.status(200).json({ reviews: await allReviews() })
    if (req.method === 'PATCH') return await updateReview(req, res)

    const { id } = req.query
    if (typeof id !== 'string' || !id) return res.status(400).json({ error: 'Missing id.' })
    await deletePhotos(id)
    await redis(['DEL', reviewKey(id)], ['ZREM', INDEX, id])
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
