// Push notifications to the staff phones (the Garage 84 mobile app) via Expo's push service.
// jk:push  set  Expo push tokens of signed-in staff phones
import { redis } from './_lib.js'

const KEY = 'jk:push'
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const isExpoToken = (token) => typeof token === 'string' && /^Expo(nent)?PushToken\[.+\]$/.test(token)

export async function addPushToken(token) {
  if (!isExpoToken(token)) throw new Error('Invalid push token')
  await redis(['SADD', KEY, token])
}

export async function removePushToken(token) {
  await redis(['SREM', KEY, token])
}

// Best effort: a failed push never breaks the booking or chat that triggered it.
// `path` is the app screen to open when the notification is tapped.
export async function notifyStaff({ title, body, path }) {
  try {
    const [tokens] = await redis(['SMEMBERS', KEY])
    if (!tokens?.length) return
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(tokens.map((to) => ({ to, title, body: body.slice(0, 180), sound: 'default', data: { path } }))),
    })
    const result = await response.json().catch(() => ({}))
    // Forget phones that uninstalled the app or turned notifications off.
    const gone = (result.data ?? [])
      .map((ticket, index) => (ticket.details?.error === 'DeviceNotRegistered' ? tokens[index] : null))
      .filter(Boolean)
    if (gone.length) await redis(['SREM', KEY, ...gone])
  } catch (error) {
    console.error('Push failed:', error)
  }
}
