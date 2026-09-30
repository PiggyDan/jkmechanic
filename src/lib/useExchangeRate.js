import { useEffect, useState } from 'react'

// Today's USD → MNT rate from /api/rate, fetched once per page load and shared by every field.
// Returns null until it arrives (or if it's unavailable), so callers simply skip the conversion.
let request

export function useExchangeRate() {
  const [rate, setRate] = useState(null)
  useEffect(() => {
    let active = true
    request ??= fetch('/api/rate')
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null)
    request.then((data) => {
      if (!active) return
      if (data?.usdToMnt) setRate(data)
      else request = undefined // try again on the next page that needs it
    })
    return () => { active = false }
  }, [])
  return rate
}
