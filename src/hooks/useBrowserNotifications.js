import { useCallback, useRef } from 'react'

function canNotify() {
  return typeof Notification !== 'undefined'
}

export function useBrowserNotifications() {
  const permissionRef = useRef(canNotify() ? Notification.permission : 'denied')

  const requestPermission = useCallback(async () => {
    if (!canNotify()) return false
    if (permissionRef.current === 'granted') return true
    if (permissionRef.current === 'denied') return false
    const result = await Notification.requestPermission()
    permissionRef.current = result
    return result === 'granted'
  }, [])

  const sendNotification = useCallback(async (title, options = {}) => {
    if (!canNotify()) return
    const granted = await requestPermission()
    if (!granted) return
    try {
      const n = new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options
      })
      if (options.onClick) {
        n.onclick = options.onClick
      }
      setTimeout(() => n.close(), 8000)
    } catch {
      // Notification may fail silently in some environments
    }
  }, [requestPermission])

  return { sendNotification, requestPermission }
}
