const CACHE = 'wtf-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data.payload
    self.registration.showNotification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: options?.tag || 'default',
      data: { url: options?.data?.url || '/' },
      ...options
    })
    setTimeout(() => {
      self.registration.getNotifications().then(notifs => {
        notifs.forEach(n => n.close())
      })
    }, 8000)
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NAVIGATE', url })
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(self.location.origin + url)
    })
  )
})
