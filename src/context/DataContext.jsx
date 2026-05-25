import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'
import { useBrowserNotifications } from '../hooks/useBrowserNotifications.js'
import { getCache, setCache, bustCache } from '../lib/queryCache.js'
import { debounce } from '../lib/debounce.js'
import { checkRateLimit } from '../lib/rateLimit.js'

const DataContext = createContext(null)

const ADMIN_EMAIL = 'bezilsire00@gmail.com'

const FUND_DATA = {
  totalRevenue: 0,
  fundAllocation: 0,
  percentAllocated: 15,
  breakdown: [
    { category: 'Explorer Gatherings', amount: 0, percent: 40, description: 'Funding meetups, co-working events and community gatherings in cities across the network.' },
    { category: 'Mission Support', amount: 0, percent: 30, description: 'Subsidizing verified missions — covering logistics, venues and coordination costs.' },
    { category: 'Community Initiatives', amount: 0, percent: 20, description: 'Supporting local projects, cultural exchanges and explorer-led community programs.' },
    { category: 'Travel Coordination', amount: 0, percent: 10, description: 'Platform development for movement tracking, verification and coordination tools.' },
  ],
  recentAllocations: []
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function saveJson(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function DataProvider({ children }) {
  const { user } = useAuth()
  const { sendNotification } = useBrowserNotifications()
  const [stays, setStays] = useState([])
  const [missions, setMissions] = useState([])
  const [feed, setFeed] = useState([])
  const [messages, setMessages] = useState(loadJson('wtf_messages', []))
  const [fund, setFund] = useState(loadJson('wtf_fund', FUND_DATA))
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [discussions, setDiscussions] = useState(loadJson('wtf_discussions', {}))
  const [groupChats, setGroupChats] = useState(loadJson('wtf_group_chats', []))
  const [notifications, setNotifications] = useState(loadJson('wtf_notifications', []))
  const [feedEvents, setFeedEvents] = useState(loadJson('wtf_feed_events', []))
  const [allProfiles, setAllProfiles] = useState([])
  const [dmHistory, setDmHistory] = useState([])
  const [bookmarks, setBookmarks] = useState(loadJson('wtf_bookmarks', []))
  const [followedDestinations, setFollowedDestinations] = useState(loadJson('wtf_followed_destinations', []))
  const [destinationMembers, setDestinationMembers] = useState(loadJson('wtf_destination_members', {}))
  const [testMissionApplications, setTestMissionApplications] = useState(loadJson('wtf_test_applications', []))
  const [testMissions, setTestMissions] = useState(loadJson('wtf_test_missions', [
    {
      id: 'tm_1',
      title: 'Bangkok Digital Nomad Hub Audit',
      type: 'Field Test',
      destination: 'Thailand',
      city: 'Bangkok',
      description: 'Evaluate coliving spaces, cafe workability, and SIM card reliability in Bangkok\'s top nomad neighborhoods. Produce a detailed field report for the network.',
      duration: '2 Weeks',
      support: ['Accommodation Covered', 'Local SIM', 'Meal Stipend'],
      requirements: ['5+ Verified Stays', 'Previous SE Asia travel', 'Detail-oriented reporting'],
      image: 'bangkok'
    },
    {
      id: 'tm_2',
      title: 'Lisbon to Porto Rail Connectivity',
      type: 'Transport Audit',
      destination: 'Portugal',
      city: 'Lisbon',
      description: 'Test and document the rail corridor between Portugal\'s two largest cities. Assess reliability, wifi, luggage policies, and nomad-friendliness of stations.',
      duration: '1 Week',
      support: ['Train Pass', 'Accommodation', 'Local Transport'],
      requirements: ['3+ Verified Stays', 'Photography skills'],
      image: 'portugal'
    },
    {
      id: 'tm_3',
      title: 'Medellin Remote Work Infrastructure',
      type: 'Infrastructure Review',
      destination: 'Colombia',
      city: 'Medellin',
      description: 'Deep dive into Medellin\'s internet reliability, co-working spaces, and neighborhood safety for remote workers. Create a definitive guide for the network.',
      duration: '3 Weeks',
      support: ['Co-working Membership', 'Accommodation', 'Translation Support'],
      requirements: ['10+ Verified Stays', 'Spanish basics preferred', 'Previous LATAM travel'],
      image: 'colombia'
    }
  ]))

  const [userVouches, setUserVouches] = useState(loadJson('wtf_user_vouches', {}))

  const [feedPage, setFeedPage] = useState(0)
  const [feedHasMore, setFeedHasMore] = useState(true)
  const [loadingFeed, setLoadingFeed] = useState(false)
  const FEED_PAGE_SIZE = 25

  const persistMessages = (v) => { setMessages(v); saveJson('wtf_messages', v) }
  const persistDiscussions = (v) => { setDiscussions(v); saveJson('wtf_discussions', v) }
  const persistGroupChats = (v) => { setGroupChats(v); saveJson('wtf_group_chats', v) }
  const persistNotifications = (v) => { setNotifications(v); saveJson('wtf_notifications', v) }
  const persistBookmarks = (v) => { setBookmarks(v); saveJson('wtf_bookmarks', v) }
  const persistFollowedDestinations = (v) => { setFollowedDestinations(v); saveJson('wtf_followed_destinations', v) }
  const persistDestinationMembers = (v) => { setDestinationMembers(v); saveJson('wtf_destination_members', v) }
  const persistTestApplications = (v) => { setTestMissionApplications(v); saveJson('wtf_test_applications', v) }

  const isAdmin = user?.email === ADMIN_EMAIL

  const addFeedEvent = useCallback((event) => {
    const e = { id: genId(), timestamp: new Date().toISOString(), ...event }
    setFeedEvents(prev => {
      const next = [e, ...prev].slice(0, 200)
      saveJson('wtf_feed_events', next)
      return next
    })
    if (event.userId) {
      supabase.from('feed_events').insert({
        user_id: event.userId,
        type: event.type || 'system_update',
        text: event.text || '',
        user_name: event.user,
        user_avatar: event.avatar || event.user?.charAt(0).toUpperCase(),
        flair: event.flair || 'system_update'
      }).then(({ error }) => {
        if (error) console.error('feed_events insert failed:', error)
      })
    }
    return e
  }, [])

  const addNotification = useCallback((userId, notif) => {
    const n = { id: genId(), timestamp: new Date().toISOString(), read: false, ...notif }
    setNotifications(prev => {
      const next = [n, ...prev]
      saveJson('wtf_notifications', next)
      return next
    })
    if (userId) {
      supabase.from('notifications').insert({
        user_id: userId,
        type: notif.type || 'general',
        title: notif.title || '',
        body: notif.body || '',
        link: notif.link || '',
        read: false
      }).then(({ error }) => {
        if (error) console.error('notifications insert failed:', error)
      })
    }
    return n
  }, [])

  const fetchFeed = useCallback(async (page = 0, append = false) => {
    if (!user) { setFeed([]); return }
    if (loadingFeed) return

    const cacheKey = `feed_page_${page}`
    const cached = getCache(cacheKey)
    if (cached && !append) {
      setFeed(cached.data)
      setFeedHasMore(cached.hasMore)
      return
    }

    setLoadingFeed(true)
    const from = page * FEED_PAGE_SIZE
    const to = from + FEED_PAGE_SIZE - 1

    const { data, error } = await supabase
      .from('posts')
      .select('id, user_id, text, image_url, flair, likes_count, timestamp')
      .order('timestamp', { ascending: false })
      .range(from, to)

    if (!error && data) {
      const hasMore = data.length === FEED_PAGE_SIZE
      const userIds = [...new Set(data.map(p => p.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds)

      const profileMap = Object.fromEntries(
        (profiles || []).map(p => [p.id, p])
      )

      const postIds = data.map(p => p.id)
      const { data: allComments } = await supabase
        .from('comments')
        .select('*')
        .in('post_id', postIds.length ? postIds : ['00000000-0000-0000-0000-000000000000'])
        .order('timestamp', { ascending: true })

      const commentsByPost = {}
      if (allComments) {
        const commentUserIds = [...new Set(allComments.map(c => c.user_id))]
        const { data: commentProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', commentUserIds)

        const commentProfileMap = Object.fromEntries(
          (commentProfiles || []).map(p => [p.id, p])
        )

        for (const c of allComments) {
          if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = []
          commentsByPost[c.post_id].push({
            id: c.id,
            userId: c.user_id,
            user: commentProfileMap[c.user_id]?.full_name || 'Explorer',
            avatar: commentProfileMap[c.user_id]?.avatar_url || 'E',
            text: c.text,
            timestamp: c.timestamp
          })
        }
      }

      const mapped = data.map(post => ({
        id: post.id,
        userId: post.user_id,
        user: profileMap[post.user_id]?.full_name || 'Explorer',
        avatar: profileMap[post.user_id]?.avatar_url || 'E',
        text: post.text,
        image: post.image_url,
        flair: post.flair,
        likes: post.likes_count,
        timestamp: post.timestamp,
        type: post.flair === 'system_update' ? post.flair : 'user_post',
        comments: commentsByPost[post.id] || []
      }))

      setCache(cacheKey, { data: mapped, hasMore }, 'feed')

      if (append) {
        setFeed(prev => [...prev, ...mapped])
      } else {
        setFeed(mapped)
        setFeedPage(0)
      }
      setFeedHasMore(hasMore)
    } else if (error) {
      console.error('Failed to fetch feed:', error)
    }
    setLoadingFeed(false)
  }, [user, loadingFeed])

  const loadMoreFeed = useCallback(() => {
    if (!feedHasMore || loadingFeed) return
    const nextPage = feedPage + 1
    setFeedPage(nextPage)
    fetchFeed(nextPage, true)
  }, [feedHasMore, loadingFeed, feedPage, fetchFeed])

  useEffect(() => {
    fetchFeed(0, false)
  }, [fetchFeed])

  useEffect(() => {
    async function initData() {
      setDestinations([
        { id: 'tokyo', name: 'Tokyo', country: 'Japan', staysCount: 156, explorers: 12, discussionsCount: 8, description: 'The hub for Japan coordination. High density of verified stays and mission reports.', image: 'https://images.unsplash.com/photo-1540959733332-e94e270b4d82?auto=format&fit=crop&w=800' },
        { id: 'berlin', name: 'Berlin', country: 'Germany', staysCount: 89, explorers: 8, discussionsCount: 5, description: 'Techno, startups and cold winters. A key node for European network movements.', image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800' },
        { id: 'nairobi', name: 'Nairobi', country: 'Kenya', staysCount: 42, explorers: 5, discussionsCount: 3, description: 'The Silicon Savannah. Coordination point for East African exploration.', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800' },
        { id: 'mexico-city', name: 'Mexico City', country: 'Mexico', staysCount: 124, explorers: 15, discussionsCount: 12, description: 'Culture, tacos and traffic. One of the most active coordination hubs in the Americas.', image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=800' }
      ])
      setLoading(false)
    }
    initData()
  }, [])

  useEffect(() => {
    if (!user) { setStays([]); return }
    async function fetchStays() {
      const cacheKey = `stays_${user.id}`
      const cached = getCache(cacheKey)
      if (cached) { setStays(cached); return }

      const { data, error } = await supabase
        .from('stays')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .range(0, 99)
      if (!error) {
        setStays(data)
        setCache(cacheKey, data, 'stays')
      }
    }
    fetchStays()
  }, [user])

  useEffect(() => {
    async function fetchMissions() {
      const cacheKey = 'missions_all'
      const cached = getCache(cacheKey)
      if (cached) { setMissions(cached); return }

      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('timestamp', { ascending: false })
        .range(0, 99)

      if (!error) {
        const loaded = data.map(m => ({
          id: m.id,
          title: m.title,
          type: m.type || 'Field Test',
          destination: m.cities || 'Global',
          city: m.cities || 'Various',
          countries: m.cities ? [m.cities] : ['Global'],
          description: m.description,
          duration: 'Various',
          startDate: m.start_date || 'TBD',
          endDate: m.end_date || 'TBD',
          joiningDeadline: m.joining_deadline || '',
          image: m.image_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800',
          support: ['Logistics', 'Funded'],
          requirements: ['Verified Explorer'],
          spots: m.spots_left || 5,
          maxParticipants: (m.spots_left || 5) + 2,
          participants: [],
          interested: [],
          leader: m.creator_name || 'Network HQ',
          leaderId: m.creator_id || 'hq',
          leaderAvatar: 'HQ',
          timestamp: m.timestamp
        }))

        const { data: participantsData } = await supabase
          .from('mission_participants')
          .select('mission_id, user_id, status')

        const participantMap = {}
        if (participantsData) {
          for (const p of participantsData) {
            if (!participantMap[p.mission_id]) {
              participantMap[p.mission_id] = { participants: [], interested: [] }
            }
            if (p.status === 'active') {
              participantMap[p.mission_id].participants.push(p.user_id)
            } else {
              participantMap[p.mission_id].interested.push(p.user_id)
            }
          }
        }

        const stored = loadJson('wtf_mission_participants', {})
        const withParticipants = loaded.map(m => ({
          ...m,
          participants: participantMap[m.id]?.participants || stored[m.id]?.participants || [],
          interested: participantMap[m.id]?.interested || stored[m.id]?.interested || []
        }))

        setMissions(withParticipants)
        setCache(cacheKey, withParticipants, 'missions')
      }
    }
    fetchMissions()
  }, [])

  const realtimeRef = useRef(null)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('id, full_name, avatar_url, username, home_country').then(({ data }) => {
      if (data) setAllProfiles(data)
    })
  }, [user])

  useEffect(() => {
    if (!user) return
    supabase.from('direct_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('timestamp', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (data) setDmHistory(data)
      })
  }, [user])

  useEffect(() => {
    if (!user) return
    const channel = supabase.channel('chat_realtime')
    channel.on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `receiver_id=eq.${user.id}` },
      (payload) => {
        const msg = {
          id: payload.new.id,
          from: payload.new.sender_name || 'Explorer',
          fromId: payload.new.sender_id,
          to: user.id,
          toName: user.full_name,
          text: payload.new.text,
          timestamp: payload.new.timestamp,
          reactions: payload.new.reactions || {},
          edited: payload.new.edited || false
        }
        setMessages(prev => {
          const exists = prev.some(m => m.id === msg.id)
          if (exists) return prev
          const next = [...prev, msg]
          saveJson('wtf_messages', next)
          return next
        })
        setDmHistory(prev => {
          const exists = prev.some(m => m.id === msg.id)
          if (exists) return prev
          return [{ ...payload.new, sender_name: payload.new.sender_name || 'Explorer' }, ...prev]
        })
      }
    )
    channel.on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `sender_id=eq.${user.id}` },
      (payload) => {
        setDmHistory(prev => {
          const exists = prev.some(m => m.id === payload.new.id)
          if (exists) return prev
          return [{ ...payload.new, sender_name: payload.new.sender_name || user.full_name }, ...prev]
        })
      }
    )
    channel.on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'direct_messages', filter: `or=(sender_id.eq.${user.id},receiver_id.eq.${user.id})` },
      (payload) => {
        setMessages(prev => {
          const next = prev.map(m => m.id === payload.new.id ? { ...m, text: payload.new.text, edited: payload.new.edited, reactions: payload.new.reactions || {} } : m)
          saveJson('wtf_messages', next)
          return next
        })
        setDmHistory(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m))
      }
    )
    channel.on('postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'direct_messages', filter: `or=(sender_id.eq.${user.id},receiver_id.eq.${user.id})` },
      (payload) => {
        setMessages(prev => {
          const next = prev.filter(m => m.id !== payload.old.id)
          saveJson('wtf_messages', next)
          return next
        })
        setDmHistory(prev => prev.filter(m => m.id !== payload.old.id))
      }
    )
    channel.on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'group_chat_messages' },
      (payload) => {
        if (payload.new.user_id === user.id) return
        const msg = {
          id: payload.new.id,
          from: payload.new.user_name || 'Explorer',
          fromId: payload.new.user_id,
          text: payload.new.text,
          timestamp: payload.new.timestamp,
          reactions: payload.new.reactions || {},
          edited: payload.new.edited || false
        }
        setGroupChats(prev => {
          const next = prev.map(gc => {
            if (gc.id !== payload.new.group_chat_id) return gc
            const exists = (gc.messages || []).some(m => m.id === msg.id)
            if (exists) return gc
            return { ...gc, messages: [...(gc.messages || []), msg] }
          })
          saveJson('wtf_group_chats', next)
          return next
        })
      }
    )
    channel.on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'group_chat_messages' },
      (payload) => {
        setGroupChats(prev => {
          const next = prev.map(gc => {
            if (!gc.messages) return gc
            return { ...gc, messages: gc.messages.map(m => m.id === payload.new.id ? { ...m, text: payload.new.text, edited: payload.new.edited, reactions: payload.new.reactions || {} } : m) }
          })
          saveJson('wtf_group_chats', next)
          return next
        })
      }
    )
    channel.on('postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'group_chat_messages' },
      (payload) => {
        setGroupChats(prev => {
          const next = prev.map(gc => {
            if (!gc.messages) return gc
            return { ...gc, messages: gc.messages.filter(m => m.id !== payload.old.id) }
          })
          saveJson('wtf_group_chats', next)
          return next
        })
      }
    )
    channel.subscribe()
    realtimeRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [user])

  const editMessage = useCallback((messageId, newText, chatType) => {
    if (!user || !newText.trim()) return
    if (chatType === 'dm') {
      setMessages(prev => {
        const next = prev.map(m => m.id === messageId ? { ...m, text: newText, edited: true, timestamp: m.timestamp } : m)
        saveJson('wtf_messages', next)
        return next
      })
      supabase.from('direct_messages').update({ text: newText, edited: true, updated_at: new Date().toISOString() }).eq('id', messageId).then(({ error }) => {
        if (error) console.error('edit DM failed:', error)
      })
    } else {
      setGroupChats(prev => {
        const next = prev.map(gc => {
          if (!gc.messages) return gc
          return { ...gc, messages: gc.messages.map(m => m.id === messageId ? { ...m, text: newText, edited: true } : m) }
        })
        saveJson('wtf_group_chats', next)
        return next
      })
      supabase.from('group_chat_messages').update({ text: newText, edited: true, updated_at: new Date().toISOString() }).eq('id', messageId).then(({ error }) => {
        if (error) console.error('edit group msg failed:', error)
      })
    }
  }, [user])

  const deleteMessage = useCallback((messageId, chatType) => {
    if (!user) return
    if (chatType === 'dm') {
      setMessages(prev => {
        const next = prev.filter(m => m.id !== messageId)
        saveJson('wtf_messages', next)
        return next
      })
      supabase.from('direct_messages').delete().eq('id', messageId).then(({ error }) => {
        if (error) console.error('delete DM failed:', error)
      })
    } else {
      setGroupChats(prev => {
        const next = prev.map(gc => {
          if (!gc.messages) return gc
          return { ...gc, messages: gc.messages.filter(m => m.id !== messageId) }
        })
        saveJson('wtf_group_chats', next)
        return next
      })
      supabase.from('group_chat_messages').delete().eq('id', messageId).then(({ error }) => {
        if (error) console.error('delete group msg failed:', error)
      })
    }
  }, [user])

  const reactToMessage = useCallback((messageId, emoji, chatType) => {
    if (!user) return
    const applyReaction = (msg) => {
      const reactions = { ...(msg.reactions || {}) }
      const users = reactions[emoji] || []
      const idx = users.indexOf(user.id)
      if (idx > -1) {
        users.splice(idx, 1)
        if (users.length === 0) delete reactions[emoji]
        else reactions[emoji] = users
      } else {
        reactions[emoji] = [...users, user.id]
      }
      return { ...msg, reactions }
    }
    if (chatType === 'dm') {
      let updatedMsg = null
      setMessages(prev => {
        const next = prev.map(m => {
          if (m.id !== messageId) return m
          updatedMsg = applyReaction(m)
          return updatedMsg
        })
        saveJson('wtf_messages', next)
        return next
      })
      if (updatedMsg) {
        supabase.from('direct_messages').update({ reactions: updatedMsg.reactions }).eq('id', messageId).then(({ error }) => {
          if (error) console.error('react DM failed:', error)
        })
      }
    } else {
      let updatedMsg = null
      setGroupChats(prev => {
        const next = prev.map(gc => {
          if (!gc.messages) return gc
          return { ...gc, messages: gc.messages.map(m => {
            if (m.id !== messageId) return m
            updatedMsg = applyReaction(m)
            return updatedMsg
          })}
        })
        saveJson('wtf_group_chats', next)
        return next
      })
      if (updatedMsg) {
        supabase.from('group_chat_messages').update({ reactions: updatedMsg.reactions }).eq('id', messageId).then(({ error }) => {
          if (error) console.error('react group msg failed:', error)
        })
      }
    }
  }, [user])

  const saveBookmark = useCallback(({ messageId, text, from, chatType, chatName }) => {
    if (!user) return
    const bm = {
      id: 'bm_' + genId(),
      messageId,
      text,
      from,
      chatType,
      chatName,
      savedAt: new Date().toISOString()
    }
    setBookmarks(prev => {
      const next = [bm, ...prev]
      saveJson('wtf_bookmarks', next)
      return next
    })
    addNotification(user.id, {
      type: 'bookmark_saved',
      title: 'Tip Saved',
      body: 'Message saved to your bookmarks.',
      link: '/profile'
    })
  }, [user])

  const removeBookmark = useCallback((bookmarkId) => {
    setBookmarks(prev => {
      const next = prev.filter(b => b.id !== bookmarkId)
      saveJson('wtf_bookmarks', next)
      return next
    })
  }, [])

  const shareToDiscussion = useCallback((text, destId) => {
    if (!user || !destId) return
    setDiscussions(prev => {
      const existing = prev[destId] || []
      const post = {
        id: genId(),
        user: user.full_name,
        userId: user.id,
        text: `📎 Shared from chat:\n\n${text}`,
        parentId: null,
        timestamp: new Date().toISOString()
      }
      const next = { ...prev, [destId]: [...existing, post] }
      saveJson('wtf_discussions', next)
      return next
    })
    supabase.from('discussion_posts').insert({
      discussion_id: destId,
      user_id: user.id,
      user_name: user.full_name,
      text: `📎 Shared from chat:\n\n${text}`
    }).then(({ error }) => {
      if (error) console.error('shareToDiscussion insert failed:', error)
    })
    addNotification(user.id, {
      type: 'shared_to_discussion',
      title: 'Shared to Discussion',
      body: 'Your message has been shared to the destination discussion.',
      link: `/destinations/${destId}`
    })
  }, [user])

  const submitStay = async (stayData) => {
    if (!user) return
    if (!checkRateLimit('submit_stay', 5)) return
    const { error } = await supabase.from('stays').insert({
      user_id: user.id,
      hotel: stayData.hotel,
      country: stayData.country,
      booking_id: stayData.bookingId,
      check_in: stayData.checkIn,
      check_out: stayData.checkOut
    })
    if (!error) {
      bustCache(`stays_${user.id}`)
      const { data } = await supabase.from('stays').select('*').eq('user_id', user.id)
      setStays(data)
      submitStayFeedEvent(user, stayData)
    }
  }

  const submitStayFeedEvent = async (usr, stayData) => {
    const { error } = await supabase.from('posts').insert({
      user_id: usr.id,
      text: `submitted a stay at ${stayData.hotel} in ${stayData.country}`,
      flair: 'system_update'
    })
    if (!error) {
      try {
        await fetchFeed()
      } catch (e) {
        console.error('fetchFeed failed after stay event:', e)
      }
    }
  }

  const createPost = async (postData) => {
    if (!user) return { success: false, error: new Error('Not authenticated') }
    if (!checkRateLimit('create_post', 10)) return { success: false, error: new Error('Slow down — max 10 posts per minute') }

    const postId = genId()
    const newPost = {
      id: postId,
      userId: user.id,
      user: postData.user || user.full_name || 'Explorer',
      avatar: postData.avatar || user.avatar_url || 'E',
      text: postData.text,
      image: postData.image || null,
      flair: postData.flair || 'note',
      likes: 0,
      timestamp: new Date().toISOString(),
      type: 'user_post',
      comments: []
    }

    setFeed(prev => [newPost, ...prev])
    setFeedEvents(prev => {
      const next = [newPost, ...prev]
      saveJson('wtf_feed_events', next)
      return next
    })

    bustCache('feed_page_')
    debounce('create_post', async () => {
      try {
        const { error } = await supabase
          .from('posts')
          .insert({ user_id: user.id, text: postData.text })
        if (!error) {
          try { await fetchFeed(0, false) } catch (_) {}
        } else {
          console.error('DB insert failed (post kept locally):', error)
        }
      } catch (e) {
        console.error('DB insert threw (post kept locally):', e)
      }
    }, 300)

    return { success: true }
  }

  const updateFeedItem = useCallback((postId, updater) => {
    setFeed(prev => {
      const found = prev.some(p => p.id === postId)
      if (!found) return prev
      return prev.map(p => p.id === postId ? updater(p) : p)
    })
    setFeedEvents(prev => {
      const found = prev.some(p => p.id === postId)
      if (!found) return prev
      const next = prev.map(p => p.id === postId ? updater(p) : p)
      saveJson('wtf_feed_events', next)
      return next
    })
  }, [])

  const removeFeedItem = useCallback((postId) => {
    setFeed(prev => prev.filter(p => p.id !== postId))
    setFeedEvents(prev => {
      const next = prev.filter(p => p.id !== postId)
      saveJson('wtf_feed_events', next)
      return next
    })
  }, [])

  const deletePost = async (postId) => {
    if (!user) return
    if (!checkRateLimit('delete_post', 10)) return
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (!error) {
        removeFeedItem(postId)
      } else {
        console.error('Failed to delete post:', error)
      }
    } catch (e) {
      console.error('delete caught', e)
    }
  }

  const repostPost = async (postData) => {
    if (!user) return
    if (!checkRateLimit('repost', 10)) return
    const repostText = `♻️ Repost\n\n${postData.text}\n\n— ${postData.originalAuthor}`
    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        text: repostText,
        flair: 'repost'
      })
      if (!error) {
        await fetchFeed()
      } else {
        console.error('Failed to repost:', error)
      }
    } catch (e) {
      console.error('repost caught', e)
    }
  }

  const likePost = async (postId) => {
    if (!postId) return
    if (!checkRateLimit(`like_${postId}`, 30)) return
    let newCount = 0
    updateFeedItem(postId, (item) => {
      newCount = (item.likes || 0) + 1
      return { ...item, likes: newCount }
    })
    if (!newCount) return
    bustCache('feed_page_')
    debounce(`like_${postId}`, async () => {
      try {
        await supabase.from('posts').update({ likes_count: newCount }).eq('id', postId)
      } catch (e) {
        console.error('like failed', e)
      }
    }, 300)
  }

  const addComment = async (postId, comment) => {
    if (!user) return
    if (!checkRateLimit(`comment_${postId}`, 10)) return
    bustCache('feed_page_')
    debounce(`comment_${postId}`, async () => {
      await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        text: comment.text
      })
    }, 300)
  }

  const startDiscussion = useCallback((countryName) => {
    const id = countryName.toLowerCase().replace(/\s+/g, '-')
    setDestinations(prev => {
      if (prev.find(d => d.id === id)) return prev
      return [{ id, name: countryName, country: countryName, staysCount: 0, explorers: 1, discussionsCount: 0, description: `Coordination hub for ${countryName}.` }, ...prev]
    })
    setDiscussions(prev => {
      const next = { ...prev, [id]: [] }
      saveJson('wtf_discussions', next)
      return next
    })
    if (user) {
      addFeedEvent({
        type: 'discussion_started',
        user: user.full_name,
        userId: user.id,
        text: `started a new coordination hub for ${countryName}`
      })
      supabase.from('discussions').insert({
        id,
        destination: countryName,
        created_by: user.id
      }).then(({ error }) => {
        if (error) console.error('discussions insert failed:', error)
      })
    }
    return id
  }, [user])

  const postToDiscussion = useCallback((destId, msg) => {
    if (!user) return
    if (!checkRateLimit(`discussion_${destId}`, 15)) return
    const post = {
      id: genId(),
      user: user.full_name,
      userId: user.id,
      text: msg.text,
      parentId: msg.parentId || null,
      timestamp: new Date().toISOString()
    }
    setDiscussions(prev => {
      const existing = prev[destId] || []
      const next = { ...prev, [destId]: [...existing, post] }
      saveJson('wtf_discussions', next)
      return next
    })
    supabase.from('discussion_posts').insert({
      discussion_id: destId,
      user_id: user.id,
      user_name: user.full_name,
      text: msg.text,
      parent_id: msg.parentId || null
    }).then(({ error }) => {
      if (error) console.error('discussion_posts insert failed:', error)
    })
  }, [user])

  const saveMissionParticipants = (allMissions) => {
    const map = {}
    allMissions.forEach(m => {
      map[m.id] = { participants: m.participants, interested: m.interested }
    })
    saveJson('wtf_mission_participants', map)
  }

  const createMission = useCallback((form) => {
    if (!user) return
    if (!checkRateLimit('create_mission', 3)) return
    const missionId = 'mission_' + genId()
    const newMission = {
      id: missionId,
      title: form.title,
      type: form.type || 'Custom',
      description: form.description,
      countries: form.countries || ['Global'],
      startDate: form.startDate || 'TBD',
      endDate: form.endDate || 'TBD',
      maxParticipants: form.maxParticipants || 12,
      joiningDeadline: form.joiningDeadline || '',
      participants: [],
      interested: [],
      leader: user.full_name,
      leaderId: user.id,
      leaderAvatar: user.avatar_url || user.full_name?.charAt(0).toUpperCase(),
      image: form.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800',
      support: ['Logistics', 'Funded'],
      requirements: ['Verified Explorer'],
      spots: 5,
      timestamp: new Date().toISOString()
    }
    setMissions(prev => {
      const updated = [newMission, ...prev]
      saveMissionParticipants(updated)
      return updated
    })
    addFeedEvent({
      type: 'mission_launch',
      user: user.full_name,
      userId: user.id,
      text: `launched a new mission: ${form.title}`
    })
    bustCache('missions_all')
    if (user) {
      supabase.from('missions').insert({
        title: form.title,
        type: form.type || 'Custom',
        description: form.description,
        cities: form.countries?.[0] || 'Global',
        spots_left: form.maxParticipants || 12,
        creator_id: user.id,
        creator_name: user.full_name
      }).then(({ error }) => {
        if (error) console.error('missions insert failed:', error)
      })
    }
    const chatId = 'chat_' + genId()
    const newChat = {
      id: chatId,
      title: form.title,
      missionId: missionId,
      createdBy: user.id,
      participants: [user.id],
      messages: []
    }
    setGroupChats(prev => {
      const next = [...prev, newChat]
      saveJson('wtf_group_chats', next)
      return next
    })
  }, [user])

  const joinMission = useCallback((missionId) => {
    if (!user) return
    if (!checkRateLimit('join_mission', 5)) return
    setMissions(prev => {
      const updated = prev.map(m => {
        if (m.id !== missionId) return m
        if (m.participants.includes(user.id)) return m
        return {
          ...m,
          participants: [...m.participants, user.id],
          spots: m.spots - 1
        }
      })
      saveMissionParticipants(updated)
      return updated
    })
    addFeedEvent({
      type: 'mission_join',
      user: user.full_name,
      userId: user.id,
      text: `joined mission`
    })
    bustCache('missions_all')
    if (user) {
      supabase.from('mission_participants').insert({
        mission_id: missionId,
        user_id: user.id,
        status: 'active'
      }).then(({ error }) => {
        if (error) console.error('mission_participants insert failed:', error)
      })
    }
    setGroupChats(prev => {
      const next = prev.map(gc => {
        if (gc.missionId === missionId && !gc.participants.includes(user.id)) {
          return { ...gc, participants: [...gc.participants, user.id] }
        }
        return gc
      })
      saveJson('wtf_group_chats', next)
      return next
    })
    addNotification(user.id, {
      type: 'mission_joined',
      title: 'Mission Joined',
      body: 'You have joined a new mission.',
      link: '/missions'
    })
  }, [user])

  const leaveMission = useCallback((missionId) => {
    if (!user) return
    setMissions(prev => {
      const updated = prev.map(m => {
        if (m.id !== missionId) return m
        if (!m.participants.includes(user.id)) return m
        return {
          ...m,
          participants: m.participants.filter(id => id !== user.id),
          spots: m.spots + 1
        }
      })
      saveMissionParticipants(updated)
      return updated
    })
    setGroupChats(prev => {
      const next = prev.map(gc => {
        if (gc.missionId !== missionId) return gc
        return { ...gc, participants: (gc.participants || []).filter(id => id !== user.id) }
      })
      saveJson('wtf_group_chats', next)
      return next
    })
    if (user) {
      supabase.from('mission_participants').delete().eq('mission_id', missionId).eq('user_id', user.id).then(({ error }) => {
        if (error) console.error('leaveMission delete failed:', error)
      })
    }
  }, [user])

  const joinDestination = useCallback((destId) => {
    if (!user) return
    setFollowedDestinations(prev => {
      if (prev.includes(destId)) return prev
      const next = [...prev, destId]
      saveJson('wtf_followed_destinations', next)
      return next
    })
    setDestinationMembers(prev => {
      const members = prev[destId] || []
      if (members.includes(user.id)) return prev
      const next = { ...prev, [destId]: [...members, user.id] }
      saveJson('wtf_destination_members', next)
      return next
    })
  }, [user])

  const leaveDestination = useCallback((destId) => {
    if (!user) return
    setFollowedDestinations(prev => {
      const next = prev.filter(d => d !== destId)
      saveJson('wtf_followed_destinations', next)
      return next
    })
    setDestinationMembers(prev => {
      const members = prev[destId] || []
      const next = { ...prev, [destId]: members.filter(id => id !== user.id) }
      saveJson('wtf_destination_members', next)
      return next
    })
  }, [user])

  const vouchUser = useCallback(({ fromId, fromName, fromAvatar, toId, toName }) => {
    if (!checkRateLimit(`vouch_${fromId}`, 10)) return
    addFeedEvent({
      type: 'vouch',
      user: fromName,
      userId: fromId,
      text: `vouched for ${toName}`
    })
    addNotification(toId, {
      type: 'vouch_received',
      title: 'You received a vouch!',
      body: `${fromName} vouched for you.`,
      link: '/profile'
    })
    sendNotification(`${fromName} vouched for you!`, {
      body: `You received a vouch from ${fromName}.`,
      tag: 'vouch'
    })
    setUserVouches(prev => {
      const next = { ...prev, [toId]: (prev[toId] || 0) + 1 }
      saveJson('wtf_user_vouches', next)
      return next
    })
    supabase.from('vouches').insert({
      from_id: fromId,
      to_id: toId
    }).then(({ error }) => {
      if (error) console.error('vouches insert failed:', error)
    })
  }, [sendNotification])

  const sendMessage = useCallback(({ from, to, text }) => {
    if (!checkRateLimit(`dm_${from?.id || user?.id}`, 20)) return
    const msgId = crypto.randomUUID()
    const msg = {
      id: msgId,
      from: from?.name || from || 'Explorer',
      fromId: from?.id || user?.id,
      to,
      text,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => {
      const next = [...prev, msg]
      saveJson('wtf_messages', next)
      return next
    })
    if (user && from?.id) {
      supabase.from('direct_messages').insert({
        id: msgId,
        sender_id: from.id,
        sender_name: from.name || user.full_name,
        receiver_id: to,
        text
      }).catch(err => console.error('direct_messages insert failed:', err))
    }
    if (to !== user?.id) {
      sendNotification(`New message from ${from?.name || 'Explorer'}`, {
        body: text?.slice(0, 100),
        tag: 'message'
      })
    }
  }, [user, sendNotification])

  const sendGroupMessage = useCallback((chatId, { from, text }) => {
    if (!checkRateLimit(`group_msg_${chatId}`, 20)) return
    const msgId = crypto.randomUUID()
    const msg = {
      id: msgId,
      from: from?.name || from || 'Explorer',
      fromId: from?.id || user?.id,
      text,
      timestamp: new Date().toISOString()
    }
    setGroupChats(prev => {
      const next = prev.map(gc => {
        if (gc.id !== chatId) return gc
        return { ...gc, messages: [...(gc.messages || []), msg] }
      })
      saveJson('wtf_group_chats', next)
      return next
    })
    if (user && from?.id) {
      supabase.from('group_chat_messages').insert({
        id: msgId,
        group_chat_id: chatId,
        user_id: from.id,
        user_name: from.name || 'Explorer',
        text
      }).catch(err => console.error('group_chat_messages insert failed:', err))
    }
  }, [user])

  const applyToTestMission = useCallback((app) => {
    if (!checkRateLimit('apply_test_mission', 5)) return
    const application = {
      id: genId(),
      ...app,
      status: 'pending',
      timestamp: new Date().toISOString()
    }
    setTestMissionApplications(prev => {
      const next = [...prev, application]
      saveJson('wtf_test_applications', next)
      return next
    })
    if (user) {
      addFeedEvent({
        type: 'test_mission_applied',
        user: user.full_name,
        userId: user.id,
        text: `applied for test mission: ${app.missionTitle}`
      })
      supabase.from('test_mission_applications').insert({
        user_id: user.id,
        mission_title: app.missionTitle,
        user_name: user.full_name,
        country: app.country,
        message: app.message,
        status: 'pending'
      }).then(({ error }) => {
        if (error) console.error('test_mission_applications insert failed:', error)
      })
    }
  }, [user])

  const updateTestMissionApplicationStatus = useCallback((appId, status) => {
    setTestMissionApplications(prev => {
      const next = prev.map(a => {
        if (a.id !== appId) return a
        if (status === 'approved') {
          addNotification(a.userId, {
            type: 'mission_approved',
            title: 'Mission Application Approved!',
            body: `Your application for "${a.missionTitle}" has been approved.`,
            link: '/test-missions'
          })
          sendNotification('Mission Approved!', {
            body: `Your application for "${a.missionTitle}" has been approved.`,
            tag: 'mission'
          })
          addFeedEvent({
            type: 'test_mission_approved',
            user: a.userName,
            userId: a.userId,
            text: `was approved for test mission: ${a.missionTitle}`
          })
        }
        return { ...a, status }
      })
      saveJson('wtf_test_applications', next)
      return next
    })
    if (status === 'approved') {
      supabase.from('test_mission_applications').update({ status }).eq('id', appId).then(({ error }) => {
        if (error) console.error('test_mission_applications update failed:', error)
      })
    }
  }, [])

  const importPastHistory = useCallback(({ countriesCount, staysCount }, usr, updateUser) => {
    updateUser({
      countries_count: usr.countries_count + countriesCount,
      stays_count: usr.stays_count + staysCount
    })
    addFeedEvent({
      type: 'import_history',
      user: usr.full_name,
      userId: usr.id,
      text: `imported ${countriesCount} countries and ${staysCount} past stays`
    })
  }, [])

  const reportUser = useCallback(({ to, from }) => {
    addNotification(to, {
      type: 'user_reported',
      title: 'User Report Submitted',
      body: 'Your report has been received. The network team will review it.',
      link: '/profile'
    })
  }, [])

  const updateFundData = useCallback((data) => {
    setFund(prev => {
      const updated = { ...prev, ...data }
      saveJson('wtf_fund', updated)
      return updated
    })
    addFeedEvent({
      type: 'fund_updated',
      user: 'Network HQ',
      text: `Explorer Fund updated — new allocation: $${data.fundAllocation?.toLocaleString() || 'N/A'}`
    })
  }, [])

  const postSystemBroadcast = useCallback(({ title, body }) => {
    addFeedEvent({
      type: 'system_broadcast',
      user: 'Network HQ',
      userAvatar: 'HQ',
      text: `**${title}** — ${body}`
    })
    setNotifications(prev => {
      const notif = {
        id: genId(),
        type: 'system_broadcast',
        title,
        body,
        link: '/feed',
        read: false,
        timestamp: new Date().toISOString()
      }
      const next = [notif, ...prev]
      saveJson('wtf_notifications', next)
      return next
    })
    try {
      supabase.from('posts').insert({
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        text: `📢 ${title}: ${body}`,
        flair: 'system_update'
      })
    } catch {}
  }, [user])

  const addTestMission = useCallback((mission) => {
    const m = { id: 'tm_' + genId(), ...mission }
    setTestMissions(prev => {
      const updated = [m, ...prev]
      saveJson('wtf_test_missions', updated)
      return updated
    })
    supabase.from('test_missions').insert({
      title: mission.title,
      type: mission.type,
      destination: mission.destination,
      city: mission.city,
      description: mission.description,
      duration: mission.duration,
      support: mission.support || [],
      requirements: mission.requirements || [],
      image: mission.image,
      image_url: mission.image_url
    }).then(({ error }) => {
      if (error) console.error('test_missions insert failed:', error)
    })
  }, [])

  const removeTestMission = useCallback((id) => {
    setTestMissions(prev => {
      const updated = prev.filter(m => m.id !== id)
      saveJson('wtf_test_missions', updated)
      return updated
    })
  }, [])

  const markNotifRead = useCallback((notifId) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === notifId ? { ...n, read: true } : n)
      saveJson('wtf_notifications', next)
      return next
    })
  }, [])

  const clearNotifs = useCallback(() => {
    setNotifications([])
    saveJson('wtf_notifications', [])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const combinedFeed = [...feedEvents.map(ev => ({
    id: ev.id,
    userId: ev.userId,
    user: ev.user || 'System',
    avatar: ev.avatar || ev.user?.charAt(0).toUpperCase() || 'S',
    text: ev.text,
    type: ev.type || 'system_update',
    flair: ev.flair || 'system_update',
    timestamp: ev.timestamp,
    likes: ev.likes ?? 0,
    comments: ev.comments || [],
    image: ev.image || null
  })), ...feed].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const value = {
    stays, missions, feed: combinedFeed, fund, destinations, loading,
    discussions, messages, groupChats, notifications,
    testMissions, testMissionApplications,
    feedEvents, userVouches, loadingFeed, feedHasMore,
    allProfiles, dmHistory, bookmarks, followedDestinations, destinationMembers,

    submitStay, createPost, deletePost, repostPost, likePost, addComment,
    startDiscussion, postToDiscussion,
    createMission, joinMission, leaveMission, vouchUser,
    joinDestination, leaveDestination,
    sendMessage, sendGroupMessage,
    editMessage, deleteMessage, reactToMessage,
    saveBookmark, removeBookmark, shareToDiscussion,
    applyToTestMission, updateTestMissionApplicationStatus,
    importPastHistory, reportUser,
    addFeedEvent, addNotification, markNotifRead, clearNotifs,
    unreadCount, loadMoreFeed,
    isAdmin, updateFundData, postSystemBroadcast, addTestMission, removeTestMission
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
