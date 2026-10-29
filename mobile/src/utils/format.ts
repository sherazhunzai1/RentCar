export function formatCurrency(amount: number | undefined | null) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T00:00:00`)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(timeStr?: string) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export function todayISO() {
  return new Date().toISOString().split('T')[0]
}
