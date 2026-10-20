// Small relative-time formatter (replaces moment.js: same "fromNow" output
// for the ranges this app shows, without the vulnerable dependency).

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const MONTH = 30 * DAY
const YEAR = 365.25 * DAY

export function timeAgo(input) {
  const then = new Date(input).getTime()
  if (!Number.isFinite(then)) return ''

  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000))

  if (seconds < 45) return 'a few seconds ago'
  if (seconds < 90) return 'a minute ago'
  if (seconds < 45 * MINUTE) return `${Math.round(seconds / MINUTE)} minutes ago`
  if (seconds < 90 * MINUTE) return 'an hour ago'
  if (seconds < 22 * HOUR) return `${Math.round(seconds / HOUR)} hours ago`
  if (seconds < 36 * HOUR) return 'a day ago'
  if (seconds < 25 * DAY) return `${Math.round(seconds / DAY)} days ago`
  if (seconds < 45 * DAY) return 'a month ago'
  if (seconds < 345 * DAY) return `${Math.round(seconds / MONTH)} months ago`
  if (seconds < 548 * DAY) return 'a year ago'
  return `${Math.round(seconds / YEAR)} years ago`
}
