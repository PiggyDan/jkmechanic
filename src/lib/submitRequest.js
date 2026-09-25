// Sends a booking/contact request to /api/requests, where it is stored for the admin page.
// `fields` is a list of { label, value } pairs shown to the admin as-is.
export async function submitRequest({ name, phone, email, service, source, fields, website, appointment }) {
  let response
  try {
    response = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, service, source, fields, website, appointment }),
    })
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const error = new Error(data.error || 'Sending failed. Please call us on +976 8885 6529.')
    error.field = data.field
    throw error
  }
}
