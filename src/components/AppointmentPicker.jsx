import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  BOOKING_DAYS_AHEAD, HOURS_TEXT, SLOTS, addDays, formatLongDay, garageNow, isOpenDay, isPastSlot, openSlots,
} from '../data/schedule'
import './appointment-picker.css'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const monthTitle = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'long', year: 'numeric' })
const utc = (date) => new Date(`${date}T00:00:00Z`)
const monthKey = (date) => date.slice(0, 7) // "2026-09"

// All days shown for a month: Monday-first weeks, blanks before the 1st.
function monthDays(key) {
  const first = `${key}-01`
  const lead = (utc(first).getUTCDay() + 6) % 7
  const days = []
  for (let date = first; monthKey(date) === key; date = addDays(date, 1)) days.push(date)
  return [...Array(lead).fill(null), ...days]
}

const shiftMonth = (key, delta) => {
  const date = utc(`${key}-01`)
  date.setUTCMonth(date.getUTCMonth() + delta)
  return date.toISOString().slice(0, 7)
}

// Month calendar + time chooser for booking forms. Days that are past, closed or fully booked
// cannot be clicked. value: { date, time } | null. `reloadKey` changes to re-fetch availability.
export default function AppointmentPicker({ value, onChange, optional = false, reloadKey = 0, error = '', onUnavailable }) {
  const [state, setState] = useState({ status: 'loading', blocked: {}, now: garageNow() })
  const [day, setDay] = useState(value?.date ?? null)
  const [month, setMonth] = useState(null)

  useEffect(() => {
    let active = true
    fetch('/api/availability')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(response.status))))
      .then((data) => active && setState({ status: 'ready', blocked: data.blocked, now: data.now }))
      .catch(() => {
        if (!active) return
        setState((current) => ({ ...current, status: 'error' }))
        onUnavailable?.()
      })
    return () => { active = false }
  }, [reloadKey, onUnavailable])

  if (state.status === 'error') {
    return (
      <p className="appt-note">
        Online booking times are unavailable right now. Write your preferred day and time in the notes, and we will confirm by phone.
      </p>
    )
  }

  const { blocked, now } = state
  const today = now.date
  const lastDay = addDays(today, BOOKING_DAYS_AHEAD)
  const firstMonth = monthKey(today)
  const lastMonth = monthKey(lastDay)
  const shownMonth = month ?? monthKey(value?.date ?? today)
  const selectedDay = day ?? value?.date ?? null

  // Why a day can't be picked (null = bookable).
  const dayState = (date) => {
    if (date < today || date > lastDay) return 'out'
    if (!isOpenDay(date)) return 'closed'
    if (!openSlots(date, blocked[date], now).length) return blocked[date] ? 'full' : 'closed'
    return null
  }

  const chooseDay = (date) => {
    setDay(date)
    if (value?.date !== date) onChange(null)
  }

  const clear = () => {
    setDay(null)
    onChange(null)
  }

  return (
    <fieldset className={`appt${error ? ' appt-invalid' : ''}`} aria-busy={state.status === 'loading'}>
      <legend>
        Day and time {optional && <em>optional</em>}
        <small>Open {HOURS_TEXT}</small>
      </legend>

      {optional && (
        <button type="button" className={`appt-any${!selectedDay ? ' selected' : ''}`} aria-pressed={!selectedDay} onClick={clear}>
          No preference, Justin will suggest a time
        </button>
      )}

      <div className="appt-cal">
        <div className="appt-cal-head">
          <button type="button" onClick={() => setMonth(shiftMonth(shownMonth, -1))} disabled={shownMonth <= firstMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <strong aria-live="polite">{monthTitle.format(utc(`${shownMonth}-01`))}</strong>
          <button type="button" onClick={() => setMonth(shiftMonth(shownMonth, 1))} disabled={shownMonth >= lastMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="appt-cal-grid" role="group" aria-label={`Days in ${monthTitle.format(utc(`${shownMonth}-01`))}`}>
          {WEEKDAYS.map((weekday) => <span key={weekday} className="appt-cal-weekday" aria-hidden="true">{weekday}</span>)}
          {monthDays(shownMonth).map((date, index) => {
            if (!date) return <span key={`blank-${index}`} aria-hidden="true" />
            const reason = state.status === 'ready' ? dayState(date) : 'out'
            const selected = selectedDay === date
            return (
              <button
                key={date}
                type="button"
                className={`appt-cal-day${reason ? ` is-${reason}` : ' is-open'}${selected ? ' selected' : ''}${date === today ? ' is-today' : ''}`}
                disabled={Boolean(reason)}
                aria-pressed={selected}
                aria-label={`${formatLongDay(date)}${reason === 'full' ? ', fully booked' : reason === 'closed' ? ', closed' : reason === 'out' ? ', not available' : ''}`}
                onClick={() => chooseDay(date)}
              >
                {Number(date.slice(8))}
              </button>
            )
          })}
        </div>

        <div className="appt-cal-legend" aria-hidden="true">
          <span><i className="dot open" /> Available</span>
          <span><i className="dot full" /> Full</span>
          <span><i className="dot closed" /> Closed</span>
        </div>
      </div>

      {selectedDay && (
        <div className="appt-slots" role="group" aria-label={`Times on ${formatLongDay(selectedDay)}`}>
          {SLOTS.map((time) => {
            const entry = blocked[selectedDay]
            const taken = entry === 'all' || (Array.isArray(entry) && entry.includes(time))
            const past = isPastSlot(selectedDay, time, now)
            const selected = value?.date === selectedDay && value?.time === time
            return (
              <button
                key={time}
                type="button"
                aria-pressed={selected}
                className={`appt-slot${selected ? ' selected' : ''}`}
                disabled={taken || past}
                title={taken ? 'Fully booked' : past ? 'Too soon' : undefined}
                onClick={() => onChange({ date: selectedDay, time })}
              >
                {time}
              </button>
            )
          })}
        </div>
      )}

      {value && <p className="appt-summary">Chosen: <strong>{formatLongDay(value.date)} at {value.time}</strong></p>}
      {error && <p className="appt-error" role="alert">{error}</p>}
    </fieldset>
  )
}
