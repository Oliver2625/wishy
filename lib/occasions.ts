// Pure (no server deps): shared by the list form preview and the server pages.

export const OCCASIONS = {
  birthday: 'Birthday',
  christmas: 'Christmas',
  wedding: 'Wedding',
  baby: 'New baby',
  other: 'Something else',
} as const
export type Occasion = keyof typeof OCCASIONS

// "12 days to go" for a future YYYY-MM-DD date, else null. Compared as calendar days, not hours.
export function daysToGo(date: string | null, today = new Date()) {
  if (!date) return null
  const days = Math.round((Date.parse(date) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 864e5)
  return days > 1 ? `${days} days to go` : days === 1 ? 'Tomorrow' : days === 0 ? 'Today' : null
}
