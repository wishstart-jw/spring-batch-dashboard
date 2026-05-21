const ONE_HOUR_SECONDS = 3600
const ONE_MINUTE_SECONDS = 60

const toDate = (value?: string | null): Date | null => {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const toNonNegativeSeconds = (seconds: number): number => {
  if (!Number.isFinite(seconds)) {
    return 0
  }

  return Math.max(0, Math.floor(seconds))
}

export const formatDurationSeconds = (seconds: number): string => {
  const safeSeconds = toNonNegativeSeconds(seconds)
  const hours = Math.floor(safeSeconds / ONE_HOUR_SECONDS)
  const minutes = Math.floor((safeSeconds % ONE_HOUR_SECONDS) / ONE_MINUTE_SECONDS)
  const remainingSeconds = safeSeconds % ONE_MINUTE_SECONDS

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  }

  return `${minutes}m ${remainingSeconds}s`
}

export const resolveDurationSeconds = (
  persistedDurationSeconds?: number | null,
  startTime?: string | null,
  endTime?: string | null
): number | null => {
  if (typeof persistedDurationSeconds === 'number' && Number.isFinite(persistedDurationSeconds)) {
    return toNonNegativeSeconds(persistedDurationSeconds)
  }

  const start = toDate(startTime)
  if (!start) {
    return null
  }

  const end = toDate(endTime) ?? new Date()
  return toNonNegativeSeconds((end.getTime() - start.getTime()) / 1000)
}

export const formatDuration = (
  persistedDurationSeconds?: number | null,
  startTime?: string | null,
  endTime?: string | null,
  fallback = '-'
): string => {
  const seconds = resolveDurationSeconds(persistedDurationSeconds, startTime, endTime)
  return seconds === null ? fallback : formatDurationSeconds(seconds)
}