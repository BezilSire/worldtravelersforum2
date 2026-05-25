const debounces = new Map()

export function debounce(key, fn, ms = 300) {
  if (debounces.has(key)) return
  debounces.set(key, setTimeout(() => {
    debounces.delete(key)
    fn()
  }, ms))
}

export function clearDebounce(key) {
  clearTimeout(debounces.get(key))
  debounces.delete(key)
}
