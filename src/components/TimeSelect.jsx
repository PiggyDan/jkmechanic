import { useState } from 'react'
import './time-select.css'

const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'))

// 24-hour time as two digit dropdowns (HH : MM) instead of the browser's time box,
// which looks different on every phone and shows AM/PM. Value is "HH:MM" or "" until both are chosen.
export default function TimeSelect({ name, label, value = '', onChange, required }) {
  const [initialHour = '', initialMinute = ''] = value ? value.split(':') : []
  const [hour, setHour] = useState(initialHour)
  const [minute, setMinute] = useState(initialMinute)

  // Parent forms reset by clearing the value; follow that (adjusting state during render, not in an effect).
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    if (!value) {
      setHour('')
      setMinute('')
    }
  }

  const update = (nextHour, nextMinute) => {
    setHour(nextHour)
    setMinute(nextMinute)
    const next = nextHour && nextMinute ? `${nextHour}:${nextMinute}` : ''
    setLastValue(next)
    onChange({ target: { name, value: next } })
  }

  return (
    <span className="time-select">
      <select value={hour} onChange={(event) => update(event.target.value, minute || (event.target.value ? '00' : ''))} required={required} aria-label={`${label}: hour`}>
        <option value="">HH</option>
        {HOURS.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <span className="time-select-colon" aria-hidden="true">:</span>
      <select value={minute} onChange={(event) => update(hour, event.target.value)} required={required} aria-label={`${label}: minutes`}>
        <option value="">MM</option>
        {MINUTES.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </span>
  )
}
