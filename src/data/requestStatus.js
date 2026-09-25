// Workshop stages for booking requests, in order. Shared by the API, /admin and the Excel export.
// To rename a stage, change its label here; keep the value (it is what is saved).
export const REQUEST_STATUSES = [
  { value: 'new', label: 'New', tone: 'orange' },
  { value: 'in_progress', label: 'Working on it', tone: 'blue' },
  { value: 'waiting_parts', label: 'Waiting for parts', tone: 'purple' },
  { value: 'waiting_work', label: 'Waiting on work', tone: 'amber' },
  { value: 'done', label: 'Done', tone: 'green' },
  { value: 'archived', label: 'Archived', tone: 'gray' },
]

export const STATUS_VALUES = REQUEST_STATUSES.map((status) => status.value)

// Requests saved before the stages existed used "handled"; show those as Done.
export const normalizeStatus = (status) => (status === 'handled' ? 'done' : STATUS_VALUES.includes(status) ? status : 'new')

export const statusLabel = (status) => REQUEST_STATUSES.find((item) => item.value === normalizeStatus(status))?.label ?? 'New'
