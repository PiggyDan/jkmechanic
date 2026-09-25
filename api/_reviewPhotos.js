// Photos attached to customer reviews. The browser shrinks them before upload; here we only
// accept real JPEG/PNG/WebP images within the size limit.
// jk:review:<id>:photo:<n>  string  JSON { type, data } (data = base64)
import { redis } from './_lib.js'

export const MAX_PHOTOS = 3
const MAX_BYTES = 600 * 1024 // per photo, after the browser's compression
const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/

export const photoKey = (reviewId, n) => `jk:review:${reviewId}:photo:${n}`

// Check the file really is the image type it claims (by its first bytes), not just its label.
const MAGIC = {
  'image/jpeg': (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  'image/png': (bytes) => bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47,
  'image/webp': (bytes) => bytes.subarray(0, 4).toString('latin1') === 'RIFF' && bytes.subarray(8, 12).toString('latin1') === 'WEBP',
}

// Returns validated photos or throws an Error with a message for the visitor.
export function parsePhotos(list) {
  if (list === undefined) return []
  if (!Array.isArray(list)) throw new Error('Invalid photos.')
  if (list.length > MAX_PHOTOS) throw new Error(`You can add up to ${MAX_PHOTOS} photos.`)
  return list.map((dataUrl) => {
    const match = typeof dataUrl === 'string' && dataUrl.match(DATA_URL)
    if (!match) throw new Error('Photos must be JPEG, PNG or WebP images.')
    const [, type, data] = match
    const bytes = Buffer.from(data, 'base64')
    if (bytes.length > MAX_BYTES) throw new Error('One of the photos is too large. Please choose a smaller photo.')
    if (!MAGIC[type](bytes)) throw new Error('One of the files is not a valid image.')
    return { type, data }
  })
}

// One command per photo keeps each request well under the database's size limit.
export async function savePhotos(reviewId, photos) {
  for (const [n, photo] of photos.entries()) {
    await redis(['SET', photoKey(reviewId, n), JSON.stringify(photo)])
  }
}

export async function getPhoto(reviewId, n) {
  const [value] = await redis(['GET', photoKey(reviewId, n)])
  return value ? JSON.parse(value) : null
}

export async function deletePhotos(reviewId, count = MAX_PHOTOS) {
  const keys = Array.from({ length: count }, (_, n) => photoKey(reviewId, n))
  if (keys.length) await redis(['DEL', ...keys])
}
