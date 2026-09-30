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
// With a rate it adds the other currency: "$25,000 USD ≈ ₮89,000,000 (1 USD = ₮3,560)".
export function describeAmount(amount, currency, usdToMnt) {
  const full = fullAmount(amount, currency)
  if (!full) return ''
  const text = currency === 'USD' ? `${full} USD` : `${Number(normaliseMnt(amount))} million MNT (${full})`
  const converted = convertedAmount(amount, currency, usdToMnt)
  return converted ? `${text} ${converted} (${formatRate(usdToMnt)})` : text
}

// Converted amount at today's rate, e.g. "≈ ₮89,000,000" for USD or "≈ $42,140" for MNT.
// MNT is rounded to the nearest thousand and USD to the nearest ten, since the rate is only a guide.
export function convertedAmount(amount, currency, usdToMnt) {
  const value = Number(currency === 'MNT' ? normaliseMnt(amount) : amount)
  if (!usdToMnt || !amount || !Number.isFinite(value) || value <= 0) return ''
  if (currency === 'USD') return `≈ ₮${grouped(Math.round((value * usdToMnt) / 1000) * 1000)}`
  return `≈ $${grouped(Math.round((value * 1e6) / usdToMnt / 10) * 10)}`
}

export const formatRate = (usdToMnt) => `1 USD = ₮${usdToMnt.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
