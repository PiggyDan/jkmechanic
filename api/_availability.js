// Days and time slots the admin has marked as full.
// jk:blocked  hash  "YYYY-MM-DD" -> "all" (whole day full) or JSON list of blocked start times
import { redis } from './_lib.js'
import { SLOTS, garageNow, isDateKey } from '../src/data/schedule.js'

const KEY = 'jk:blocked'

export async function getBlocked() {
  const [flat] = await redis(['HGETALL', KEY])
  const today = garageNow().date
  const blocked = {}
  const past = []
  for (let i = 0; i < flat.length; i += 2) {
    const [date, value] = [flat[i], flat[i + 1]]
    if (date < today) past.push(date)
    else blocked[date] = value === 'all' ? 'all' : JSON.parse(value)
  }
  if (past.length) await redis(['HDEL', KEY, ...past])
  return blocked
}

// all: true blocks the whole day; otherwise only `slots` are blocked (empty = fully open).
export async function setBlocked(date, { all, slots = [] }) {
  if (!isDateKey(date)) throw new Error('Invalid date')
  const times = slots.filter((time) => SLOTS.includes(time))
  if (all) await redis(['HSET', KEY, date, 'all'])
  else if (times.length) await redis(['HSET', KEY, date, JSON.stringify([...new Set(times)].sort())])
  else await redis(['HDEL', KEY, date])
}
