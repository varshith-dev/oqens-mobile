/**
 * Converts a date to a short "time ago" format matching the web app
 * e.g. 5s, 9m, 3h, 2d, 1w, 3mo, 1y
 */
export function timeAgoShort(date: string | Date | null | undefined): string {
  if (!date) return ''
  try {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `${weeks}w`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo`
    return `${Math.floor(months / 12)}y`
  } catch {
    return ''
  }
}
