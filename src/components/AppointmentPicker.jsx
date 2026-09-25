import { useEffect, useState } from 'react'
import {
  BOOKING_DAYS_AHEAD, HOURS_TEXT, SLOTS, formatDay, formatLongDay, garageNow, isOpenDay, isPastSlot, openSlots, upcomingDays,
} from '../data/schedule'
import './appointment-picker.css'

const FIRST_DAYS = 10

// Day + time chooser for booking forms. Days and slots the admin marked as full are disabled.
// value: { date, time } | null. `reloadKey` changes to re-fetch availability (e.g. after a clash).
export default function AppointmentPicker({ value, onChange, optional = false, reloadKey = 0, error = '', onUnavailable }) {
  const [state, setState] = useState({ status: 'loading', blocked: {}, now: garageNow() })
  const [showAll, setShowAll] = useState(false)
  const [day, setDay] = useState(value?.date ?? null)

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
  const days = upcomingDays(BOOKING_DAYS_AHEAD + 1, now).filter(isOpenDay)
  const shownDays = showAll ? days : days.slice(0, FIRST_DAYS)
  const selectedDay = day ?? value?.date ?? null

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

      <div className="appt-days" role="group" aria-label="Choose a day">
        {optional && (
          <button type="button" aria-pressed={!selectedDay} className={`appt-day${!selectedDay ? ' selected' : ''}`} onClick={clear}>
            <strong>Any</strong>
            <small>No preference</small>
          </button>
        )}
        {shownDays.map((date) => {
          const free = openSlots(date, blocked[date], now).length
          // No times left only because it's too late today -> "Closed"; blocked by the admin -> "Full".
          const noneLabel = blocked[date] ? 'Full' : 'Closed'
          const [weekday, ...rest] = formatDay(date).split(' ')
          return (
            <button
              key={date}
              type="button"
              aria-pressed={selectedDay === date}
              aria-label={`${formatLongDay(date)}${free ? '' : blocked[date] ? ', fully booked' : ', no more times today'}`}
              className={`appt-day${selectedDay === date ? ' selected' : ''}`}
              disabled={state.status !== 'ready' || !free}
              onClick={() => chooseDay(date)}
            >
              <span>{weekday}</span>
              <strong>{rest.join(' ')}</strong>
              <small>{free ? `${free} free` : noneLabel}</small>
            </button>
          )
        })}
      </div>
      {!showAll && days.length > FIRST_DAYS && (
        <button type="button" className="appt-more" onClick={() => setShowAll(true)}>Show more days</button>
      )}

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
