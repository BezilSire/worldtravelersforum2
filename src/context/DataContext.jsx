import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'

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

  const persistMessages = (v) => { setMessages(v); saveJson('wtf_messages', v) }
  const persistDiscussions = (v) => { setDiscussions(v); saveJson('wtf_discussions', v) }
  const persistGroupChats = (v) => { setGroupChats(v); saveJson('wtf_group_chats', v) }
  const persistNotifications = (v) => { setNotifications(v); saveJson('wtf_notifications', v) }
  const persistTestApplications = (v) => { setTestMissionApplications(v); saveJson('wtf_test_applications', v) }

  const isAdmin = user?.email === ADMIN_EMAIL

  const addFeedEvent = useCallback((event) => {
    const e = { id: genId(), timestamp: new Date().toISOString(), ...event }
    setFeedEvents(prev => {
      const next = [e, ...prev].slice(0, 200)
      saveJson('wtf_feed_events', next)
      return next
    })
    return e
  }, [])

  const addNotification = useCallback((userId, notif) => {
    const n = { id: genId(), timestamp: new Date().toISOString(), read: false, ...notif }
    setNotifications(prev => {
      const next = [n, ...prev]
      saveJson('wtf_notifications', next)
      return next
    })
    return n
  }, [])

  const fetchFeed = useCallback(async () => {
    if (!user) { setFeed([]); return }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('timestamp', { ascending: false })

    if (!error && data) {
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

      setFeed(data.map(post => ({
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
      })))
    } else if (error) {
      console.error('Failed to fetch feed:', error)
    }
  }, [user])

  useEffect(() => {
    fetchFeed()
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
      const { data, error } = await supabase
        .from('stays')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
      if (!error) setStays(data)
    }
    fetchStays()
  }, [user])

  useEffect(() => {
    async function fetchMissions() {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('timestamp', { ascending: false })

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

        const stored = loadJson('wtf_mission_participants', {})
        const withParticipants = loaded.map(m => ({
          ...m,
          participants: stored[m.id]?.participants || [],
          interested: stored[m.id]?.interested || []
        }))

        setMissions(withParticipants)
      }
    }
    fetchMissions()
  }, [])

  const submitStay = async (stayData) => {
    if (!user) return
    const { error } = await supabase.from('stays').insert({
      user_id: user.id,
      hotel: stayData.hotel,
      country: stayData.country,
      booking_id: stayData.bookingId,
      check_in: stayData.checkIn,
      check_out: stayData.checkOut
    })
    if (!error) {
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

    try {
      const { error } = await supabase
        .from('posts')
        .insert({ user_id: user.id, text: postData.text })
      if (!error) {
        try { await fetchFeed() } catch (_) {}
      } else {
        console.error('DB insert failed (post kept locally):', error)
      }
    } catch (e) {
      console.error('DB insert threw (post kept locally):', e)
    }

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
    let newCount = 0
    updateFeedItem(postId, (item) => {
      newCount = (item.likes || 0) + 1
      return { ...item, likes: newCount }
    })
    if (!newCount) return
    try {
      await supabase.from('posts').update({ likes_count: newCount }).eq('id', postId)
    } catch (e) {
      console.error('like failed', e)
    }
  }

  const addComment = async (postId, comment) => {
    if (!user) return
    await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      text: comment.text
    })
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
    }
    return id
  }, [user])

  const postToDiscussion = useCallback((destId, msg) => {
    if (!user) return
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

  const vouchUser = useCallback(({ fromId, fromName, fromAvatar, toId, toName }) => {
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
    setUserVouches(prev => {
      const next = { ...prev, [toId]: (prev[toId] || 0) + 1 }
      saveJson('wtf_user_vouches', next)
      return next
    })
  }, [])

  const sendMessage = useCallback(({ from, to, text }) => {
    const msg = {
      id: genId(),
      from,
      to,
      text,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => {
      const next = [...prev, msg]
      saveJson('wtf_messages', next)
      return next
    })
  }, [])

  const sendGroupMessage = useCallback((chatId, { from, text }) => {
    const msg = {
      id: genId(),
      from,
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
  }, [])

  const applyToTestMission = useCallback((app) => {
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
  }, [])

  const importPastHistory = useCallback(({ countriesCount, staysCount }, usr, updateUser) => {
    updateUser({
      countries_count: usr.countries_count + countriesCount,
      stays_count: usr.stays_count + staysCount,
      xp: usr.xp + (countriesCount * 50) + (staysCount * 30)
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
    feedEvents, userVouches,

    submitStay, createPost, deletePost, repostPost, likePost, addComment,
    startDiscussion, postToDiscussion,
    createMission, joinMission, vouchUser,
    sendMessage, sendGroupMessage,
    applyToTestMission, updateTestMissionApplicationStatus,
    importPastHistory, reportUser,
    addFeedEvent, addNotification, markNotifRead, clearNotifs,
    unreadCount,
    isAdmin, updateFundData, postSystemBroadcast, addTestMission, removeTestMission
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
