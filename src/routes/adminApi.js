// Helpers shared by the admin page and its chat inbox.

export async function adminApi(token, path, method = 'GET', { body, query = '' } = {}) {
  const response = await fetch(`/api/${path}${query}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`)
    error.status = response.status
    throw error
  }
  return data
}

// Name or number once the visitor has shared them (the AI asks for it), otherwise "Visitor ABCD".
export const chatLabel = (chat) => chat.contactName || chat.contactPhone || `Visitor ${chat.id.slice(0, 4).toUpperCase()}`

export const timeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export function timeAgo(timestamp) {
  const minutes = Math.round((Date.now() - timestamp) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

// Two-note chime made with Web Audio, so no sound file is needed. Browsers only allow
// sound after the admin has clicked somewhere on the page (signing in counts).
let audioContext
export function playChime() {
  try {
    audioContext ??= new AudioContext()
    if (audioContext.state === 'suspended') audioContext.resume()
    const start = audioContext.currentTime
    ;[880, 1320].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      const at = start + index * 0.18
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.25, at + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.5)
      oscillator.connect(gain).connect(audioContext.destination)
      oscillator.start(at)
      oscillator.stop(at + 0.5)
    })
  } catch {
    // Audio unavailable; the banner still shows.
  }
}
