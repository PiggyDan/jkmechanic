// Saves booking requests as a CSV file that opens in Excel / Google Sheets.
// Every form field gets its own column, so different services' fields line up.

const cell = (value) => {
  let text = String(value ?? '')
  // Excel runs cells starting with = + - @ as formulas (e.g. "+976 …" phone numbers, or anything a
  // visitor typed). A leading apostrophe keeps them as plain text.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const pad = (value) => String(value).padStart(2, '0')
const dateTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const STATUS_LABELS = { new: 'New', handled: 'Handled', archived: 'Archived' }

export function requestsToCsv(requests) {
  const fieldLabels = [...new Set(requests.flatMap((request) => request.fields.map((field) => field.label)))]
  const header = ['Received', 'Status', 'Name', 'Phone', 'Email', 'Service', 'Appointment', 'Source', ...fieldLabels]
  const rows = requests.map((request) => {
    const fields = Object.fromEntries(request.fields.map((field) => [field.label, field.value]))
    return [
      dateTime(request.createdAt),
      STATUS_LABELS[request.status] ?? request.status,
      request.name,
      request.phone,
      request.email,
      request.service,
      request.appointment ? `${request.appointment.date} ${request.appointment.time}` : '',
      request.source,
      ...fieldLabels.map((label) => fields[label] ?? ''),
    ]
  })
  return [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')
}

export function downloadCsv(filename, csv) {
  // The BOM makes Excel read the file as UTF-8, so Mongolian (Cyrillic) text shows correctly.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
