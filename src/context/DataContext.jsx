import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'
import { useBrowserNotifications } from '../hooks/useBrowserNotifications.js'
import { useFeedQuery, useCreatePost, useLikePost, useDeletePost, useRepostPost, useAddComment } from '../hooks/useFeed.js'
import { useUIStore } from '../stores/uiStore.js'
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
  const queryClient = useQueryClient()

  // ---- TanStack Query hooks ----
  const feedQuery = useFeedQuery()
  const createPostMutation = useCreatePost()
  const deletePostMutation = useDeletePost()
  const repostPostMutation = useRepostPost()
  const addCommentMutation = useAddComment()
  const likeMutation = useLikePost()

  const [stays, setStays] = useState([])
  const [missions, setMissions] = useState([])
  const [fund, setFund] = useState(FUND_DATA)
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [groupChats, setGroupChats] = useState([])
  const [notifications, setNotifications] = useState([])
  const [feedEvents, setFeedEvents] = useState([])
  const [allProfiles, setAllProfiles] = useState([])
  const [dmHistory, setDmHistory] = useState([])
  const [followedDestinations, setFollowedDestinations] = useState([])
  const [destinationMembers, setDestinationMembers] = useState({})
  const [testMissionApplications, setTestMissionApplications] = useState([])
  const [testMissions, setTestMissions] = useState([
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
  ])

  const [userVouches, setUserVouches] = useState(loadJson('wtf_user_vouches', {}))
  const [userLikes, setUserLikes] = useState(loadJson('wtf_user_likes', {}))
  const DEFAULT_RESOURCES = [
    { id: 'visa', label: 'Visas & Entry', icon: 'globe', tips: [] },
    { id: 'safety', label: 'Safety Tips', icon: 'shield', tips: [] },
    { id: 'internet', label: 'Internet & SIM', icon: 'wifi', tips: [] },
    { id: 'transport', label: 'Getting Around', icon: 'car', tips: [] },
    { id: 'accommodation', label: 'Where to Stay', icon: 'map-pin', tips: [] },
    { id: 'budget', label: 'Cost & Budget', icon: 'dollar', tips: [] },
    { id: 'food', label: 'Food & Culture', icon: 'utensils', tips: [] },
  ]
  const [destinationResources, setDestinationResources] = useState(() => {
    const saved = loadJson('wtf_destination_resources', {})
    Object.keys(saved).forEach(k => {
      saved[k] = DEFAULT_RESOURCES.map(def => {
        const existing = saved[k].find(r => r.id === def.id)
        return existing || { ...def }
      })
    })
    return saved
  })

  const isAdmin = user?.email === ADMIN_EMAIL

  const addFeedEvent = useCallback((event) => {
    const e = { id: genId(), timestamp: new Date().toISOString(), ...event }
    setFeedEvents(prev => [e, ...prev].slice(0, 200))
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
    setNotifications(prev => [n, ...prev])
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

  useEffect(() => {
    if (!user) { setStays([]); return }
    supabase.from('stays')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .range(0, 99)
      .then(({ data, error }) => { if (!error) setStays(data) })
  }, [user])

  useEffect(() => {
    supabase.from('missions')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(0, 99)
      .then(async ({ data, error }) => {
        if (error) return
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
        const { data: participantsData } = await supabase.from('mission_participants').select('mission_id, user_id, status')
        const participantMap = {}
        if (participantsData) {
          for (const p of participantsData) {
            if (!participantMap[p.mission_id]) participantMap[p.mission_id] = { participants: [], interested: [] }
            if (p.status === 'active') participantMap[p.mission_id].participants.push(p.user_id)
            else participantMap[p.mission_id].interested.push(p.user_id)
          }
        }
        setMissions(loaded.map(m => ({
          ...m,
          participants: participantMap[m.id]?.participants || [],
          interested: participantMap[m.id]?.interested || []
        })))
      })
  }, [])

  const realtimeRef = useRef(null)
  const groupChatSubscriptions = useRef({})

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('id, full_name, avatar_url, username, home_country').then(({ data }) => {
      if (data) setAllProfiles(data)
    })
  }, [user])

  useEffect(() => {
    if (!user) { setUserLikes({}); return }
    supabase.from('post_likes').select('post_id').eq('user_id', user.id).then(({ data }) => {
      if (data) {
        const likes = Object.fromEntries(data.map(l => [l.post_id, true]))
        setUserLikes(likes)
      }
    })
  }, [user])

  useEffect(() => {
    if (!user) return
    supabase.from('direct_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('timestamp', { ascending: false })
      .limit(200)
      .then(({ data }) => { if (data) setDmHistory(data) })
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
          if (prev.some(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        setDmHistory(prev => {
          if (prev.some(m => m.id === msg.id)) return prev
          return [{ ...payload.new, sender_name: payload.new.sender_name || 'Explorer' }, ...prev]
        })
      }
    )
    channel.on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `sender_id=eq.${user.id}` },
      (payload) => {
        setDmHistory(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev
          return [{ ...payload.new, sender_name: payload.new.sender_name || user.full_name }, ...prev]
        })
      }
    )
    channel.on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'direct_messages', filter: `or=(sender_id.eq.${user.id},receiver_id.eq.${user.id})` },
      (payload) => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, text: payload.new.text, edited: payload.new.edited, reactions: payload.new.reactions || {} } : m))
        setDmHistory(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m))
      }
    )
    channel.on('postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'direct_messages', filter: `or=(sender_id.eq.${user.id},receiver_id.eq.${user.id})` },
      (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id))
        setDmHistory(prev => prev.filter(m => m.id !== payload.old.id))
      }
    )
    channel.subscribe()
    realtimeRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [user])

  const subscribeToGroupChat = useCallback((chatId) => {
    if (!chatId || groupChatSubscriptions.current[chatId]) return
    if (!user) return
    const channel = supabase.channel(`group_chat_broadcast_${chatId}`)
    channel.on('broadcast', { event: 'new_message' }, (payload) => {
      if (payload.fromId === user.id) return
      const msg = {
        id: payload.id,
        from: payload.from || 'Explorer',
        fromId: payload.fromId,
        text: payload.text,
        timestamp: payload.timestamp,
        reactions: payload.reactions || {},
        edited: payload.edited || false
      }
      setGroupChats(prev => prev.map(gc => {
        if (gc.id !== chatId) return gc
        if ((gc.messages || []).some(m => m.id === msg.id)) return gc
        return { ...gc, messages: [...(gc.messages || []), msg] }
      }))
    })
    channel.on('broadcast', { event: 'update_message' }, (payload) => {
      setGroupChats(prev => prev.map(gc => {
        if (gc.id !== chatId || !gc.messages) return gc
        return { ...gc, messages: gc.messages.map(m => m.id === payload.id ? { ...m, ...payload } : m) }
      }))
    })
    channel.on('broadcast', { event: 'delete_message' }, (payload) => {
      setGroupChats(prev => prev.map(gc => {
        if (gc.id !== chatId || !gc.messages) return gc
        return { ...gc, messages: gc.messages.filter(m => m.id !== payload.id) }
      }))
    })
    channel.subscribe((status) => {
      if (status !== 'SUBSCRIBED') console.warn('broadcast channel status:', status)
    })
    groupChatSubscriptions.current[chatId] = channel
  }, [user])

  const unsubscribeFromGroupChat = useCallback((chatId) => {
    const channel = groupChatSubscriptions.current[chatId]
    if (channel) {
      supabase.removeChannel(channel)
      delete groupChatSubscriptions.current[chatId]
    }
  }, [])

  useEffect(() => {
    if (!user) {
      Object.values(groupChatSubscriptions.current).forEach(ch => { try { supabase.removeChannel(ch) } catch {} })
      groupChatSubscriptions.current = {}
    }
  }, [user])

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

  const editMessage = useCallback((messageId, newText, chatType) => {
    if (!user || !newText.trim()) return
    if (chatType === 'dm') {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: newText, edited: true, timestamp: m.timestamp } : m))
      supabase.from('direct_messages').update({ text: newText, edited: true, updated_at: new Date().toISOString() }).eq('id', messageId).then(({ error }) => {
        if (error) console.error('edit DM failed:', error)
      })
    } else {
      let chatId = null
      setGroupChats(prev => {
        const chat = prev.find(gc => gc.messages?.some(m => m.id === messageId))
        if (chat) chatId = chat.id
        return prev.map(gc => {
          if (!gc.messages) return gc
          return { ...gc, messages: gc.messages.map(m => m.id === messageId ? { ...m, text: newText, edited: true } : m) }
        })
      })
      supabase.from('group_chat_messages').update({ text: newText, edited: true, updated_at: new Date().toISOString() }).eq('id', messageId).then(({ error }) => {
        if (error) console.error('edit group msg failed:', error)
      })
      if (chatId) {
        const ch = groupChatSubscriptions.current[chatId]
        if (ch) ch.send({ type: 'broadcast', event: 'update_message', payload: { id: messageId, text: newText, edited: true } })
      }
    }
  }, [user])

  const deleteMessage = useCallback((messageId, chatType) => {
    if (!user) return
    if (chatType === 'dm') {
      setMessages(prev => prev.filter(m => m.id !== messageId))
      supabase.from('direct_messages').delete().eq('id', messageId).then(({ error }) => {
        if (error) console.error('delete DM failed:', error)
      })
    } else {
      let chatId = null
      setGroupChats(prev => {
        const chat = prev.find(gc => gc.messages?.some(m => m.id === messageId))
        if (chat) chatId = chat.id
        return prev.map(gc => {
          if (!gc.messages) return gc
          return { ...gc, messages: gc.messages.filter(m => m.id !== messageId) }
        })
      })
      supabase.from('group_chat_messages').delete().eq('id', messageId).then(({ error }) => {
        if (error) console.error('delete group msg failed:', error)
      })
      if (chatId) {
        const ch = groupChatSubscriptions.current[chatId]
        if (ch) ch.send({ type: 'broadcast', event: 'delete_message', payload: { id: messageId } })
      }
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
      setMessages(prev => prev.map(m => { if (m.id !== messageId) return m; updatedMsg = applyReaction(m); return updatedMsg }))
      if (updatedMsg) {
        supabase.from('direct_messages').update({ reactions: updatedMsg.reactions }).eq('id', messageId).then(({ error }) => {
          if (error) console.error('react DM failed:', error)
        })
      }
    } else {
      let updatedMsg = null
      let chatId = null
      setGroupChats(prev => {
        updatedMsg = null
        chatId = null
        const next = prev.map(gc => {
          if (!gc.messages) return gc
          return { ...gc, messages: gc.messages.map(m => { if (m.id !== messageId) return m; updatedMsg = applyReaction(m); chatId = gc.id; return updatedMsg }) }
        })
        return next
      })
      if (updatedMsg) {
        supabase.from('group_chat_messages').update({ reactions: updatedMsg.reactions }).eq('id', messageId).then(({ error }) => {
          if (error) console.error('react group msg failed:', error)
        })
        if (chatId) {
          const ch = groupChatSubscriptions.current[chatId]
          if (ch) ch.send({ type: 'broadcast', event: 'update_message', payload: { id: messageId, reactions: updatedMsg.reactions } })
        }
      }
    }
  }, [user])

  const saveBookmark = useCallback(({ messageId, text, from, chatType, chatName }) => {
    if (!user) return
    const bm = { id: 'bm_' + genId(), messageId, text, from, chatType, chatName, savedAt: new Date().toISOString() }
    useUIStore.getState().saveBookmark(bm)
    addNotification(user.id, { type: 'bookmark_saved', title: 'Tip Saved', body: 'Message saved to your bookmarks.', link: '/profile' })
  }, [user])

  const removeBookmark = useCallback((bookmarkId) => {
    useUIStore.getState().removeBookmark(bookmarkId)
  }, [])

  const shareToDiscussion = useCallback((text, destId) => {
    if (!user || !destId) return
    supabase.from('discussion_posts').insert({
      discussion_id: destId, user_id: user.id, user_name: user.full_name, text: `📎 Shared from chat:\n\n${text}`
    }).then(({ error }) => {
      if (error) console.error('shareToDiscussion insert failed:', error)
    })
    addNotification(user.id, { type: 'shared_to_discussion', title: 'Shared to Discussion', body: 'Your message has been shared to the destination discussion.', link: `/destinations/${destId}` })
  }, [user])

  const submitStay = async (stayData) => {
    if (!user) return
    if (!checkRateLimit('submit_stay', 5)) return
    const { error } = await supabase.from('stays').insert({
      user_id: user.id, hotel: stayData.hotel, country: stayData.country,
      booking_id: stayData.bookingId, check_in: stayData.checkIn, check_out: stayData.checkOut
    })
    if (!error) {
      const { data } = await supabase.from('stays').select('*').eq('user_id', user.id)
      if (data) setStays(data)
      supabase.from('posts').insert({
        user_id: user.id, text: `submitted a stay at ${stayData.hotel} in ${stayData.country}`, flair: 'system_update'
      }).then(() => queryClient.invalidateQueries({ queryKey: ['feed'] }))
    }
  }

  const createPost = async (postData) => {
    if (!user) return { success: false, error: new Error('Not authenticated') }
    if (!checkRateLimit('create_post', 10)) return { success: false, error: new Error('Slow down — max 10 posts per minute') }
    try {
      await createPostMutation.mutateAsync({ text: postData.text, image: postData.image, flair: postData.flair || 'note', userId: user.id })
      return { success: true }
    } catch (e) {
      return { success: false, error: e }
    }
  }

  const deletePost = async (postId) => {
    if (!user) return
    if (!checkRateLimit('delete_post', 10)) return
    try {
      await deletePostMutation.mutateAsync(postId)
    } catch (e) {
      console.error('deletePost failed:', e)
    }
  }

  const repostPost = async (postData) => {
    if (!user) return
    if (!checkRateLimit('repost', 10)) return
    try {
      await repostPostMutation.mutateAsync(postData)
    } catch (e) {
      console.error('repostPost failed:', e)
    }
  }

  const likePost = async (postId) => {
    if (!postId || !user) return
    if (!checkRateLimit(`like_${postId}`, 30)) return

    const isLiked = !!userLikes[postId]

    setUserLikes(prev => {
      const next = { ...prev, [postId]: !isLiked }
      saveJson('wtf_user_likes', next)
      return next
    })

    likeMutation.mutate({ postId, userId: user.id, isLiked })
  }

  const addComment = async (postId, comment) => {
    if (!user) return
    if (!checkRateLimit(`comment_${postId}`, 10)) return
    try {
      await addCommentMutation.mutateAsync({ postId, text: comment.text })
    } catch (e) {
      console.error('addComment failed:', e)
    }
  }

  const [discussions, setDiscussions] = useState({})

  useEffect(() => {
    if (!user) return
    supabase.from('discussion_posts').select('*').order('timestamp', { ascending: false }).limit(200).then(({ data }) => {
      if (!data) return
      const grouped = {}
      for (const p of data) {
        if (!grouped[p.discussion_id]) grouped[p.discussion_id] = []
        grouped[p.discussion_id].push({
          id: p.id, user: p.user_name || 'Explorer', userId: p.user_id,
          text: p.text, parentId: p.parent_id, topic: p.topic || 'general',
          edited: p.edited || false, timestamp: p.timestamp
        })
      }
      setDiscussions(grouped)
    })
  }, [user])

  const startDiscussion = useCallback((countryName) => {
    const id = countryName.toLowerCase().replace(/\s+/g, '-')
    setDestinations(prev => {
      if (prev.find(d => d.id === id)) return prev
      return [{ id, name: countryName, country: countryName, staysCount: 0, explorers: 1, discussionsCount: 0, description: `Coordination hub for ${countryName}.` }, ...prev]
    })
    if (user) {
      addFeedEvent({ type: 'discussion_started', user: user.full_name, userId: user.id, text: `started a new coordination hub for ${countryName}` })
      supabase.from('discussions').insert({ id, destination: countryName, created_by: user.id }).then(({ error }) => {
        if (error) console.error('discussions insert failed:', error)
      })
    }
    return id
  }, [user])

  const postToDiscussion = useCallback((destId, msg) => {
    if (!user) return
    if (!checkRateLimit(`discussion_${destId}`, 15)) return
    const post = {
      id: genId(), user: user.full_name, userId: user.id, text: msg.text,
      parentId: msg.parentId || null, topic: msg.topic || 'general',
      timestamp: new Date().toISOString()
    }
    setDiscussions(prev => {
      const existing = prev[destId] || []
      return { ...prev, [destId]: [...existing, post] }
    })
    supabase.from('discussion_posts').insert({
      discussion_id: destId, user_id: user.id, user_name: user.full_name,
      text: msg.text, parent_id: msg.parentId || null, topic: msg.topic || 'general'
    }).then(({ error }) => {
      if (error) console.error('discussion_posts insert failed:', error)
    })
  }, [user])

  const editDiscussionPost = useCallback((destId, postId, newText) => {
    if (!user || !newText.trim()) return
    setDiscussions(prev => {
      const existing = prev[destId] || []
      return { ...prev, [destId]: existing.map(p => p.id === postId && p.userId === user.id ? { ...p, text: newText, edited: true } : p) }
    })
    supabase.from('discussion_posts').update({ text: newText, edited: true, updated_at: new Date().toISOString() }).eq('id', postId).then(({ error }) => {
      if (error) console.error('edit discussion post failed:', error)
    })
  }, [user])

  const deleteDiscussionPost = useCallback((destId, postId) => {
    if (!user) return
    setDiscussions(prev => {
      const existing = prev[destId] || []
      return { ...prev, [destId]: existing.filter(p => p.id !== postId || p.userId !== user.id) }
    })
    supabase.from('discussion_posts').delete().eq('id', postId).then(({ error }) => {
      if (error) console.error('delete discussion post failed:', error)
    })
  }, [user])

  const addResourceTip = useCallback((destId, resourceId, tip) => {
    if (!user || !tip.trim()) return
    setDestinationResources(prev => {
      const destRsrcs = prev[destId]
        ? prev[destId].map(r => r.id === resourceId ? { ...r, tips: [...r.tips, { text: tip, user: user.full_name, userId: user.id, timestamp: new Date().toISOString() }] } : r)
        : DEFAULT_RESOURCES.map(r => r.id === resourceId ? { ...r, tips: [{ text: tip, user: user.full_name, userId: user.id, timestamp: new Date().toISOString() }] } : { ...r })
      return { ...prev, [destId]: destRsrcs }
    })
  }, [user])

  const updateMission = useCallback((missionId, updates) => {
    if (!user) return
    setMissions(prev => prev.map(m => m.id === missionId ? { ...m, ...updates } : m))
    supabase.from('missions').update(updates).eq('id', missionId).then(({ error }) => {
      if (error) console.error('mission update failed:', error)
    })
  }, [user])

  const createMission = useCallback((form) => {
    if (!user) return
    if (!checkRateLimit('create_mission', 3)) return
    const missionId = 'mission_' + genId()
    const newMission = {
      id: missionId, title: form.title, type: form.type || 'Custom', description: form.description,
      countries: form.countries || ['Global'], startDate: form.startDate || 'TBD', endDate: form.endDate || 'TBD',
      maxParticipants: form.maxParticipants || 12, joiningDeadline: form.joiningDeadline || '',
      participants: [], interested: [], leader: user.full_name, leaderId: user.id,
      leaderAvatar: user.avatar_url || user.full_name?.charAt(0).toUpperCase(),
      image: form.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800',
      banner: form.banner || '', rules: form.rules || [], joinType: form.joinType || 'open',
      checklist: [], schedule: [], resources: [], support: ['Logistics', 'Funded'],
      requirements: ['Verified Explorer'], spots: 5, timestamp: new Date().toISOString()
    }
    setMissions(prev => [newMission, ...prev])
    addFeedEvent({ type: 'mission_launch', user: user.full_name, userId: user.id, text: `launched a new mission: ${form.title}` })
    supabase.from('missions').insert({
      title: form.title, type: form.type || 'Custom', description: form.description,
      cities: form.countries?.[0] || 'Global', spots_left: form.maxParticipants || 12,
      creator_id: user.id, creator_name: user.full_name
    }).then(({ error }) => { if (error) console.error('missions insert failed:', error) })
    const chatId = crypto.randomUUID()
    setGroupChats(prev => [...prev, { id: chatId, title: form.title, missionId, createdBy: user.id, participants: [user.id], messages: [] }])
    subscribeToGroupChat(chatId)
  }, [user])

  const joinMission = useCallback((missionId) => {
    if (!user) return
    if (!checkRateLimit('join_mission', 5)) return
    setMissions(prev => prev.map(m => {
      if (m.id !== missionId || m.participants.includes(user.id)) return m
      return { ...m, participants: [...m.participants, user.id], spots: m.spots - 1 }
    }))
    addFeedEvent({ type: 'mission_join', user: user.full_name, userId: user.id, text: `joined mission` })
    supabase.from('mission_participants').insert({ mission_id: missionId, user_id: user.id, status: 'active' }).then(({ error }) => {
      if (error) console.error('mission_participants insert failed:', error)
    })
    let chatId = null
    setGroupChats(prev => {
      const next = prev.map(gc => {
        if (gc.missionId === missionId && !gc.participants.includes(user.id)) {
          chatId = gc.id
          return { ...gc, participants: [...gc.participants, user.id] }
        }
        return gc
      })
      return next
    })
    if (chatId) subscribeToGroupChat(chatId)
    addNotification(user.id, { type: 'mission_joined', title: 'Mission Joined', body: 'You have joined a new mission.', link: '/missions' })
  }, [user])

  const leaveMission = useCallback((missionId) => {
    if (!user) return
    setMissions(prev => prev.map(m => {
      if (m.id !== missionId || !m.participants.includes(user.id)) return m
      return { ...m, participants: m.participants.filter(id => id !== user.id), spots: m.spots + 1 }
    }))
    let chatId = null
    setGroupChats(prev => {
      const next = prev.map(gc => {
        if (gc.missionId !== missionId) return gc
        chatId = gc.id
        return { ...gc, participants: (gc.participants || []).filter(id => id !== user.id) }
      })
      return next
    })
    supabase.from('mission_participants').delete().eq('mission_id', missionId).eq('user_id', user.id).then(({ error }) => {
      if (error) console.error('leaveMission delete failed:', error)
    })
    if (chatId) unsubscribeFromGroupChat(chatId)
  }, [user])

  const joinDestination = useCallback((destId) => {
    if (!user) return
    setFollowedDestinations(prev => prev.includes(destId) ? prev : [...prev, destId])
    setDestinationMembers(prev => {
      const members = prev[destId] || []
      if (members.includes(user.id)) return prev
      return { ...prev, [destId]: [...members, user.id] }
    })
  }, [user])

  const leaveDestination = useCallback((destId) => {
    if (!user) return
    setFollowedDestinations(prev => prev.filter(d => d !== destId))
    setDestinationMembers(prev => {
      const members = prev[destId] || []
      return { ...prev, [destId]: members.filter(id => id !== user.id) }
    })
  }, [user])

  const vouchUser = useCallback(({ fromId, fromName, fromAvatar, toId, toName }) => {
    if (!checkRateLimit(`vouch_${fromId}`, 10)) return
    addFeedEvent({ type: 'vouch', user: fromName, userId: fromId, text: `vouched for ${toName}` })
    addNotification(toId, { type: 'vouch_received', title: 'You received a vouch!', body: `${fromName} vouched for you.`, link: '/profile' })
    sendNotification(`${fromName} vouched for you!`, { body: `You received a vouch from ${fromName}.`, tag: 'vouch' })
    setUserVouches(prev => { const next = { ...prev, [toId]: (prev[toId] || 0) + 1 }; saveJson('wtf_user_vouches', next); return next })
    supabase.from('vouches').insert({ from_id: fromId, to_id: toId }).then(({ error }) => {
      if (error) console.error('vouches insert failed:', error)
    })
  }, [sendNotification])

  const sendMessage = useCallback(({ from, to, text }) => {
    if (!checkRateLimit(`dm_${from?.id || user?.id}`, 20)) return
    const msgId = crypto.randomUUID()
    const msg = { id: msgId, from: from?.name || from || 'Explorer', fromId: from?.id || user?.id, to, text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, msg])
    if (user && from?.id) {
      supabase.from('direct_messages').insert({ id: msgId, sender_id: from.id, sender_name: from.name || user.full_name, receiver_id: to, text }).catch(err => console.error('direct_messages insert failed:', err))
    }
    if (to !== user?.id) {
      sendNotification(`New message from ${from?.name || 'Explorer'}`, { body: text?.slice(0, 100), tag: 'message' })
    }
  }, [user, sendNotification])

  const sendGroupMessage = useCallback((chatId, { from, text }) => {
    if (!checkRateLimit(`group_msg_${chatId}`, 20)) return
    const msgId = crypto.randomUUID()
    const msg = { id: msgId, from: from?.name || from || 'Explorer', fromId: from?.id || user?.id, text, timestamp: new Date().toISOString() }
    setGroupChats(prev => prev.map(gc => gc.id !== chatId ? gc : { ...gc, messages: [...(gc.messages || []), msg] }))
    if (user && from?.id) {
      supabase.from('group_chat_messages').insert({ id: msgId, group_chat_id: chatId, user_id: from.id, user_name: from.name || 'Explorer', text }).catch(err => console.error('group_chat_messages insert failed:', err))
    }
    const ch = groupChatSubscriptions.current[chatId]
    if (ch) ch.send({ type: 'broadcast', event: 'new_message', payload: msg })
  }, [user])

  const applyToTestMission = useCallback((app) => {
    if (!checkRateLimit('apply_test_mission', 5)) return
    const application = { id: genId(), ...app, status: 'pending', timestamp: new Date().toISOString() }
    setTestMissionApplications(prev => [...prev, application])
    if (user) {
      addFeedEvent({ type: 'test_mission_applied', user: user.full_name, userId: user.id, text: `applied for test mission: ${app.missionTitle}` })
      supabase.from('test_mission_applications').insert({
        user_id: user.id, mission_title: app.missionTitle, user_name: user.full_name, country: app.country, message: app.message, status: 'pending'
      }).then(({ error }) => { if (error) console.error('test_mission_applications insert failed:', error) })
    }
  }, [user])

  const updateTestMissionApplicationStatus = useCallback((appId, status) => {
    setTestMissionApplications(prev => prev.map(a => {
      if (a.id !== appId) return a
      if (status === 'approved') {
        addNotification(a.userId, { type: 'mission_approved', title: 'Mission Application Approved!', body: `Your application for "${a.missionTitle}" has been approved.`, link: '/test-missions' })
        sendNotification('Mission Approved!', { body: `Your application for "${a.missionTitle}" has been approved.`, tag: 'mission' })
        addFeedEvent({ type: 'test_mission_approved', user: a.userName, userId: a.userId, text: `was approved for test mission: ${a.missionTitle}` })
      }
      return { ...a, status }
    }))
    if (status === 'approved') {
      supabase.from('test_mission_applications').update({ status }).eq('id', appId).then(({ error }) => {
        if (error) console.error('test_mission_applications update failed:', error)
      })
    }
  }, [])

  const importPastHistory = useCallback(({ countriesCount, staysCount }, usr, updateUser) => {
    updateUser({ countries_count: usr.countries_count + countriesCount, stays_count: usr.stays_count + staysCount })
    addFeedEvent({ type: 'import_history', user: usr.full_name, userId: usr.id, text: `imported ${countriesCount} countries and ${staysCount} past stays` })
  }, [])

  const reportUser = useCallback(({ to, from }) => {
    addNotification(to, { type: 'user_reported', title: 'User Report Submitted', body: 'Your report has been received. The network team will review it.', link: '/profile' })
  }, [])

  const updateFundData = useCallback((data) => {
    setFund(prev => ({ ...prev, ...data }))
    addFeedEvent({ type: 'fund_updated', user: 'Network HQ', text: `Explorer Fund updated — new allocation: $${data.fundAllocation?.toLocaleString() || 'N/A'}` })
  }, [])

  const postSystemBroadcast = useCallback(({ title, body }) => {
    addFeedEvent({ type: 'system_broadcast', user: 'Network HQ', userAvatar: 'HQ', text: `**${title}** — ${body}` })
    setNotifications(prev => [{ id: genId(), type: 'system_broadcast', title, body, link: '/feed', read: false, timestamp: new Date().toISOString() }, ...prev])
    supabase.from('posts').insert({ text: `📢 ${title}: ${body}`, flair: 'system_update' }).catch(() => {})
  }, [])

  const addTestMission = useCallback((mission) => {
    setTestMissions(prev => [{ id: 'tm_' + genId(), ...mission }, ...prev])
    supabase.from('test_missions').insert({
      title: mission.title, type: mission.type, destination: mission.destination,
      city: mission.city, description: mission.description, duration: mission.duration,
      support: mission.support || [], requirements: mission.requirements || [],
      image: mission.image, image_url: mission.image_url
    }).then(({ error }) => { if (error) console.error('test_missions insert failed:', error) })
  }, [])

  const removeTestMission = useCallback((id) => {
    setTestMissions(prev => prev.filter(m => m.id !== id))
  }, [])

  const markNotifRead = useCallback((notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n))
  }, [])

  const clearNotifs = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const feed = feedQuery.data?.pages.flatMap(p => p.posts) || []

  const combinedFeed = [...feedEvents.map(ev => ({
    id: ev.id, userId: ev.userId, user: ev.user || 'System',
    avatar: ev.avatar || ev.user?.charAt(0).toUpperCase() || 'S',
    text: ev.text, type: ev.type || 'system_update', flair: ev.flair || 'system_update',
    timestamp: ev.timestamp, likes: ev.likes ?? 0, comments: ev.comments || [], image: ev.image || null
  })), ...feed].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const value = {
    stays, missions, feed: combinedFeed, fund, destinations, loading,
    discussions, messages, groupChats, notifications,
    testMissions, testMissionApplications,
    feedEvents, userLikes, userVouches, loadingFeed: feedQuery.isFetching, feedHasMore: feedQuery.hasNextPage,
    allProfiles, dmHistory, bookmarks: useUIStore.getState().bookmarks,
    followedDestinations, destinationMembers, destinationResources, DEFAULT_RESOURCES,

    submitStay, createPost, deletePost, repostPost, likePost, addComment,
    startDiscussion, postToDiscussion,
    createMission, updateMission, joinMission, leaveMission, vouchUser,
    joinDestination, leaveDestination,
    sendMessage, sendGroupMessage,
    editMessage, deleteMessage, reactToMessage,
    saveBookmark, removeBookmark, shareToDiscussion,
    editDiscussionPost, deleteDiscussionPost, addResourceTip,
    applyToTestMission, updateTestMissionApplicationStatus,
    importPastHistory, reportUser,
    addFeedEvent, addNotification, markNotifRead, clearNotifs,
    unreadCount, loadMoreFeed: feedQuery.fetchNextPage,
    isAdmin, updateFundData, postSystemBroadcast, addTestMission, removeTestMission
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
