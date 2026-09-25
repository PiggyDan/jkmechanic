// What customers can't book:
//   jk:blocked  hash  "YYYY-MM-DD" -> "all" (whole day full) or JSON list of blocked start times  (set by the admin)
//   jk:booked   hash  "YYYY-MM-DD HH:MM" -> request id                                           (held by a booking)
//                     "YYYY-MM-DD day"   -> request id   an afternoon booking (DAY_LOCK_FROM or later) takes the whole day
// A customer's booking holds its slot automatically; the admin can reopen it (or archive/delete the booking).
import { redis } from './_lib.js'
import { SLOTS, garageNow, isDateKey, locksWholeDay } from '../src/data/schedule.js'

const KEY = 'jk:blocked'
const BOOKED = 'jk:booked'
const slotField = ({ date, time }) => `${date} ${time}`
const dayField = ({ date }) => `${date} day`

// Days and times the admin marked as full.
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

// Times held by customers' bookings: { "YYYY-MM-DD": ["10:00", ...] or "all" (afternoon booking took the day) }.
// Past days are cleaned up.
export async function getBooked() {
  const [flat] = await redis(['HGETALL', BOOKED])
  const today = garageNow().date
  const booked = {}
  const past = []
  for (let i = 0; i < flat.length; i += 2) {
    const [date, time] = flat[i].split(' ')
    if (date < today) past.push(flat[i])
    else if (time === 'day') booked[date] = 'all'
    else if (booked[date] !== 'all') (booked[date] ??= []).push(time)
  }
  if (past.length) await redis(['HDEL', BOOKED, ...past])
  return booked
}

// Admin blocks + booked times, in the same shape the booking calendar understands.
export function mergeUnavailable(blocked, booked) {
  const merged = { ...blocked }
  for (const [date, times] of Object.entries(booked)) {
    if (merged[date] === 'all') continue
    merged[date] = times === 'all' ? 'all' : [...new Set([...(merged[date] ?? []), ...times])].sort()
  }
  return merged
}

export async function getUnavailable() {
  const [blocked, booked] = await Promise.all([getBlocked(), getBooked()])
  return mergeUnavailable(blocked, booked)
}

// Holds a slot for a booking. Returns false if the time (or the day) is taken already.
// Uses set-if-empty, so two customers can never get the same time, and two afternoon
// bookings can never both take the same day.
export async function holdSlot(appointment, requestId) {
  const wholeDay = locksWholeDay(appointment.time)
  if (wholeDay) {
    const [dayCreated] = await redis(['HSETNX', BOOKED, dayField(appointment), requestId])
    if (dayCreated !== 1) return false
  }
  const [created] = await redis(['HSETNX', BOOKED, slotField(appointment), requestId])
  if (created !== 1) {
    if (wholeDay) await releaseField(dayField(appointment), requestId)
    return false
  }
  if (!wholeDay) {
    // A morning booking arriving just after an afternoon booking took the day: give the time back.
    const [dayHolder] = await redis(['HGET', BOOKED, dayField(appointment)])
    if (dayHolder && dayHolder !== requestId) {
      await releaseField(slotField(appointment), requestId)
      return false
    }
  }
  return true
}

async function releaseField(field, requestId) {
  const [holder] = await redis(['HGET', BOOKED, field])
  if (holder === requestId) await redis(['HDEL', BOOKED, field])
}

// Frees a booking's time (and its day, for an afternoon booking), only if this booking holds them.
export async function releaseSlot(appointment, requestId) {
  await releaseField(slotField(appointment), requestId)
  if (locksWholeDay(appointment.time)) await releaseField(dayField(appointment), requestId)
}
