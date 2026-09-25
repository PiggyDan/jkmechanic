// Opening hours and appointment slots. Shared by the website and the API, so changing
// hours here updates the booking picker, the server-side checks and the chat answers.
export const TIME_ZONE = 'Asia/Ulaanbaatar'
export const OPEN_WEEKDAYS = [1, 2, 3, 4, 5] // Monday–Friday (0 = Sunday)
export const HOURS_TEXT = 'Monday–Friday, 9:00–18:00'
export const HOURS_SHORT = 'Mon–Fri 9:00–18:00'
// Appointment start times; the last one leaves an hour before closing.
export const SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
export const BOOKING_DAYS_AHEAD = 42
// A booking at this time or later takes the whole day (no other bookings that day).
// Earlier (morning) bookings only take their own time.
export const DAY_LOCK_FROM = '12:00'
export const locksWholeDay = (time) => time >= DAY_LOCK_FROM
// Same-day bookings need at least this much notice.
const MIN_NOTICE_MINUTES = 60

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
export const isDateKey = (value) => typeof value === 'string' && DATE_PATTERN.test(value)

// Current date ("YYYY-MM-DD") and minutes past midnight at the garage, wherever the code runs.
export function garageNow(at = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(at).map((part) => [part.type, part.value]),
  )
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) }
}

// Date keys are calendar dates, so do the arithmetic in UTC to avoid DST/local-time drift.
const toUtc = (date) => new Date(`${date}T00:00:00Z`)
export function addDays(date, days) {
  const next = toUtc(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next.toISOString().slice(0, 10)
}

export const isOpenDay = (date) => OPEN_WEEKDAYS.includes(toUtc(date).getUTCDay())

const toMinutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))

export function isPastSlot(date, time, now = garageNow()) {
  if (date < now.date) return true
  return date === now.date && toMinutes(time) < now.minutes + MIN_NOTICE_MINUTES
}

// blockedEntry is 'all' (day is full) or a list of blocked start times.
export function openSlots(date, blockedEntry, now = garageNow()) {
  if (!isOpenDay(date) || blockedEntry === 'all') return []
  const blocked = Array.isArray(blockedEntry) ? blockedEntry : []
  return SLOTS.filter((time) => !blocked.includes(time) && !isPastSlot(date, time, now))
}

export function upcomingDays(count, now = garageNow()) {
  return Array.from({ length: count }, (_, index) => addDays(now.date, index))
}

const dayFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' })
const longDayFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' })
export const formatDay = (date) => dayFormat.format(toUtc(date)) // "Mon 29 Sep"
export const formatLongDay = (date) => longDayFormat.format(toUtc(date)) // "Monday 29 September"

// Why a requested appointment can't be booked, or null if it can.
export function appointmentProblem({ date, time } = {}, blocked = {}, now = garageNow()) {
  if (!isDateKey(date) || !SLOTS.includes(time)) return 'Please choose a day and time.'
  if (date > addDays(now.date, BOOKING_DAYS_AHEAD)) return 'Please choose a day within the next 6 weeks.'
  if (!isOpenDay(date)) return `We are open ${HOURS_TEXT}. Please choose a weekday.`
  if (isPastSlot(date, time, now)) return 'That time is too soon or has passed. Please choose a later time.'
  if (!openSlots(date, blocked[date], now).includes(time)) return 'Sorry, that time is fully booked. Please choose another time.'
  return null
}
