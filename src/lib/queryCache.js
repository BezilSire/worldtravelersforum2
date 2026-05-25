const cache = new Map()

const TTLS = {
  feed: 15_000,
  profiles: 60_000,
  stays: 30_000,
  missions: 30_000,
  comments: 10_000,
  default: 30_000,
}

export function getCache(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return null
  }
  return entry.data
}

export function setCache(key, data, ttl) {
  cache.set(key, {
    data,
    expiry: Date.now() + (TTLS[ttl] || TTLS.default),
  })
}

export function bustCache(pattern) {
  if (!pattern) { cache.clear(); return }
  for (const key of cache.keys()) {
    if (key.startsWith(pattern)) cache.delete(key)
  }
}
