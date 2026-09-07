export const money = value =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

export const date = value => {
  if (!value) return '-'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('en-GB')
}

export const label = value => {
  const text = String(value || '').trim()
  if (!text) return '-'
  return text.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

export const flowLabel = value =>
  value === 'pre_wedding' ? 'Pre-wedding' : value === 'post_wedding' ? 'Post-wedding' : label(value || 'Not selected')
