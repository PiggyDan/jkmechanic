import { useEffect, useState } from 'react'
import { CalendarX2, CalendarCheck2 } from 'lucide-react'
import { adminApi } from './adminApi'
import {
  BOOKING_DAYS_AHEAD, HOURS_TEXT, SLOTS, addDays, formatLongDay, garageNow, isOpenDay,
} from '../data/schedule'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKS = Math.ceil((BOOKING_DAYS_AHEAD + 7) / 7)
const dayNumber = (date) => Number(date.slice(8, 10))
const monthName = (date) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'short' }).format(new Date(`${date}T00:00:00Z`))

// Calendar where the admin marks days or single time slots as full.
// Customers can't pick blocked days/times, and the server rejects them too.
export default function AdminSchedule({ token, requests, onError }) {
  const [state, setState] = useState({ status: 'loading', blocked: {}, now: garageNow() })
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/availability')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Could not load the schedule.'))))
      .then((data) => active && setState({ status: 'ready', blocked: data.blocked, now: data.now }))
      .catch((err) => active && onError(err))
    return () => { active = false }
  }, [onError])

  const { blocked, now } = state
  const today = now.date
  const lastDay = addDays(today, BOOKING_DAYS_AHEAD)
  const mondayOffset = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7
  const start = addDays(today, -mondayOffset)
  const days = Array.from({ length: WEEKS * 7 }, (_, index) => addDays(start, index))

  // Bookings per day and per slot, from the requests already loaded on the admin page.
  const bookings = {}
  for (const request of requests ?? []) {
    if (!request.appointment || request.status === 'archived') continue
    ;(bookings[request.appointment.date] ??= []).push(request)
  }

  const save = async (date, { all, slots }) => {
    setSaving(true)
    try {
      const data = await adminApi(token, 'availability', 'PUT', { body: { date, all, slots } })
      setState((current) => ({ ...current, blocked: data.blocked }))
    } catch (err) {
      onError(err)
    } finally {
      setSaving(false)
    }
  }

  const entry = selected ? blocked[selected] : undefined
  const dayFull = entry === 'all'
  const blockedSlots = Array.isArray(entry) ? entry : []

  const toggleSlot = (time) => {
    const next = blockedSlots.includes(time) ? blockedSlots.filter((slot) => slot !== time) : [...blockedSlots, time]
    // Blocking every slot is the same as marking the day full.
    if (next.length === SLOTS.length) save(selected, { all: true })
    else save(selected, { all: false, slots: next })
  }

  return (
    <div className="admin-schedule">
      <div className="admin-calendar">
        <p className="admin-schedule-intro">
          Open {HOURS_TEXT}. Click a day to mark it full or block single times. Customers can't book blocked days or times.
        </p>
        <div className="admin-calendar-grid" aria-label="Booking calendar">
          {WEEKDAYS.map((weekday) => <div key={weekday} className="admin-calendar-weekday" aria-hidden="true">{weekday}</div>)}
          {days.map((date) => {
            const outside = date < today || date > lastDay
            const closed = !isOpenDay(date)
            const value = blocked[date]
            const count = bookings[date]?.length ?? 0
            const status = outside ? '' : closed ? 'Closed' : value === 'all' ? 'Full' : Array.isArray(value) ? `${value.length} blocked` : 'Open'
            return (
              <button
                key={date}
                type="button"
                className={[
                  'admin-calendar-day',
                  outside && 'is-outside',
                  closed && 'is-closed',
                  value === 'all' && 'is-full',
                  Array.isArray(value) && 'is-partial',
                  date === today && 'is-today',
                  date === selected && 'is-selected',
                ].filter(Boolean).join(' ')}
                disabled={outside || closed || state.status !== 'ready'}
                onClick={() => setSelected(date)}
                aria-label={`${formatLongDay(date)}: ${status || 'unavailable'}${count ? `, ${count} booked` : ''}`}
              >
                <span className="admin-calendar-date">
                  {dayNumber(date)}
                  {(dayNumber(date) === 1 || date === today) && <small> {monthName(date)}</small>}
                </span>
                {status && <span className="admin-calendar-status">{status}</span>}
                {count > 0 && <span className="admin-calendar-count">{count} booked</span>}
              </button>
            )
          })}
        </div>
      </div>

      <aside className="admin-day-panel" aria-live="polite">
        {!selected ? (
          <p className="admin-day-empty">Choose a day in the calendar.</p>
        ) : (
          <>
            <h2>{formatLongDay(selected)}</h2>
            <button
              type="button"
              className={`admin-btn ${dayFull ? '' : 'admin-btn-danger-solid'}`}
              onClick={() => save(selected, dayFull ? { all: false, slots: [] } : { all: true })}
              disabled={saving}
            >
              {dayFull ? <><CalendarCheck2 size={15} /> Reopen this day</> : <><CalendarX2 size={15} /> Mark whole day as full</>}
            </button>

            <h3>Times</h3>
            <div className="admin-slot-grid">
              {SLOTS.map((time) => {
                const isBlocked = dayFull || blockedSlots.includes(time)
                const booked = (bookings[selected] ?? []).filter((request) => request.appointment.time === time).length
                return (
                  <button
                    key={time}
                    type="button"
                    className={`admin-slot${isBlocked ? ' is-blocked' : ''}`}
                    aria-pressed={isBlocked}
                    disabled={dayFull || saving}
                    onClick={() => toggleSlot(time)}
                    title={isBlocked ? 'Blocked: click to open' : 'Open: click to block'}
                  >
                    <strong>{time}</strong>
                    <small>{isBlocked ? 'Blocked' : 'Open'}{booked ? ` · ${booked} booked` : ''}</small>
                  </button>
                )
              })}
            </div>

            <h3>Bookings this day</h3>
            {(bookings[selected] ?? []).length === 0 ? (
              <p className="admin-day-empty">No bookings yet.</p>
            ) : (
              <ul className="admin-day-bookings">
                {[...bookings[selected]]
                  .sort((a, b) => a.appointment.time.localeCompare(b.appointment.time))
                  .map((request) => (
                    <li key={request.id}>
                      <strong>{request.appointment.time}</strong> {request.name} · {request.service || 'General enquiry'}
                      <a href={`tel:${request.phone.replace(/[^\d+]/g, '')}`}>{request.phone}</a>
                    </li>
                  ))}
              </ul>
            )}
          </>
        )}
      </aside>
    </div>
  )
}
