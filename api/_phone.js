// Finds a phone number in free text, so a number a visitor types in the chat is saved
// for Justin automatically. Accepts Mongolian 8-digit numbers (with or without +976)
// and international numbers written with a leading +. Years, prices and mileage don't match.
const CANDIDATE = /\+?\d[\d\s().-]{5,20}\d/g

export function findPhone(text) {
  for (const match of String(text ?? '').matchAll(CANDIDATE)) {
    const raw = match[0].trim()
    const digits = raw.replace(/\D/g, '')
    if (raw.startsWith('+')) {
      if (digits.length >= 8 && digits.length <= 15) return raw
    } else if (digits.length === 8 && /^[5-9]/.test(digits)) {
      return raw // local Mongolian number, e.g. 9911 2233 (they start with 5–9; years start with 1–2)
    } else if (digits.length === 11 && digits.startsWith('976')) {
      return `+${digits}` // 976 9911 2233 written without the +
    }
  }
  return null
}
