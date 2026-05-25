import { useCallback, useRef, useEffect, useState } from 'react'

function canNotify() {
  return typeof Notification !== 'undefined'
}

let swRegistration = null

function getSW() {
  if (swRegistration) return Promise.resolve(swRegistration)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return navigator.serviceWorker.ready.then(reg => {
      swRegistration = reg
      return reg
    }).catch(() => null)
  }
  return Promise.resolve(null)
}

export function useBrowserNotifications() {
  const permissionRef = useRef(canNotify() ? Notification.permission : 'denied')
  const [swReady, setSwReady] = useState(false)

  useEffect(() => {
    getSW().then(reg => setSwReady(!!reg))
  }, [])

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

    const payload = {
      title,
      options: {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options,
        data: { url: options?.data?.url || options?.link || '/' }
      }
    }

    if (swReady) {
      try {
        const reg = await getSW()
        if (reg?.active) {
          reg.active.postMessage({ type: 'SHOW_NOTIFICATION', payload })
          return
        }
      } catch {}
    }

    try {
      const n = new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options
      })
      if (options.onClick) n.onclick = options.onClick
      setTimeout(() => n.close(), 8000)
    } catch {}
  }, [requestPermission, swReady])

  return { sendNotification, requestPermission, swReady }
}
