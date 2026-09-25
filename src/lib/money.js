// Amounts for price/budget fields. MNT is entered in millions ("150" = ₮150,000,000),
// USD as a plain number ("45000" = $45,000).
export const CURRENCIES = ['MNT', 'USD']

// Keep digits and one decimal point.
export function cleanAmount(text) {
  const [whole, ...rest] = String(text).replace(/[^\d.]/g, '').split('.')
  return rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole
}

// Someone typing all the zeros in million mode (150000000) almost certainly meant 150 million.
export function normaliseMnt(amount) {
  const value = Number(amount)
  return value >= 10000 ? String(Math.round((value / 1e6) * 100) / 100) : amount
}

const grouped = (value) => Math.round(value).toLocaleString('en-US')

export function fullAmount(amount, currency) {
  const value = Number(currency === 'MNT' ? normaliseMnt(amount) : amount)
  if (!amount || !Number.isFinite(value) || value <= 0) return ''
  return currency === 'USD' ? `$${grouped(value)}` : `₮${grouped(value * 1e6)}`
}

// Text stored with the request, e.g. "150 million MNT (₮150,000,000)" or "$45,000 USD".
export function describeAmount(amount, currency) {
  const full = fullAmount(amount, currency)
  if (!full) return ''
  return currency === 'USD' ? `${full} USD` : `${Number(normaliseMnt(amount))} million MNT (${full})`
}
