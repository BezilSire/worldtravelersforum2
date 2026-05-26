import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set) => ({
      bookmarks: [],
      sidebarCollapsed: false,
      activeFeedTab: 'notes',
      notificationsEnabled: false,

      setActiveFeedTab: (tab) => set({ activeFeedTab: tab }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),

      saveBookmark: (bm) => set((s) => ({ bookmarks: [bm, ...s.bookmarks] })),
      removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
      clearBookmarks: () => set({ bookmarks: [] }),
    }),
    { name: 'wtf_ui_store' }
  )
)
