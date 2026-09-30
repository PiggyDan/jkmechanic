// GET /api/rate — public: today's USD → MNT exchange rate, for converting prices on the buy/sell form.
// Source: ExchangeRate-API's free open endpoint (updated once a day, attribution required).
// The rate is cached in Redis for a few hours; if the source is down, the last known rate is used.
import { redis, redisConfigured } from './_lib.js'

const SOURCE_URL = 'https://open.er-api.com/v6/latest/USD'
const CACHE_KEY = 'jk:rate:usd-mnt'
const LAST_KEY = 'jk:rate:usd-mnt:last'
const CACHE_SECONDS = 6 * 60 * 60

let memory = null // used when storage isn't configured, and between requests on a warm instance

async function fetchRate() {
  const response = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error(`Rate source answered ${response.status}`)
  const data = await response.json()
  const usdToMnt = Number(data?.rates?.MNT)
  if (data?.result !== 'success' || !Number.isFinite(usdToMnt) || usdToMnt <= 0) throw new Error('Rate source returned no MNT rate')
  return { usdToMnt, updated: data.time_last_update_utc ?? null }
}

async function getRate() {
  const useRedis = redisConfigured()
  if (memory && Date.now() - memory.fetchedAt < CACHE_SECONDS * 1000) return memory
  if (useRedis) {
    const [cached] = await redis(['GET', CACHE_KEY])
    if (cached) return (memory = { ...JSON.parse(cached), fetchedAt: Date.now() })
  }
  try {
    const rate = await fetchRate()
    memory = { ...rate, fetchedAt: Date.now() }
    if (useRedis) {
      const value = JSON.stringify(rate)
      await redis(['SET', CACHE_KEY, value, 'EX', String(CACHE_SECONDS)], ['SET', LAST_KEY, value])
    }
    return memory
  } catch (error) {
    // Source unavailable: fall back to the last rate we saw, however old.
    if (memory) return memory
    if (useRedis) {
      const [last] = await redis(['GET', LAST_KEY])
      if (last) return { ...JSON.parse(last), stale: true }
    }
    throw error
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' })
  try {
    const { usdToMnt, updated, stale = false } = await getRate()
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json({ usdToMnt, updated, stale, source: 'ExchangeRate-API', sourceUrl: 'https://www.exchangerate-api.com' })
  } catch (error) {
    console.error('Exchange rate unavailable:', error)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(503).json({ error: 'Exchange rate unavailable right now.' })
  }
}
