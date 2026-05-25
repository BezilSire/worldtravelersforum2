const limits = new Map()

export function checkRateLimit(key, maxPerMinute = 30) {
  const now = Date.now()
  const windowMs = 60_000
  if (!limits.has(key)) limits.set(key, [])
  const timestamps = limits.get(key).filter(t => now - t < windowMs)
  if (timestamps.length >= maxPerMinute) return false
  timestamps.push(now)
  limits.set(key, timestamps)
  return true
}

export function getRateLimitRemaining(key, maxPerMinute = 30) {
  const now = Date.now()
  const windowMs = 60_000
  const timestamps = (limits.get(key) || []).filter(t => now - t < windowMs)
  return Math.max(0, maxPerMinute - timestamps.length)
}
