import { createContext, useContext, useState } from 'react'

const DataContext = createContext(null)

const INITIAL_STAYS = [
  { id: 's1', userId: 'usr_001', hotel: 'Meikles Hotel', country: 'Zimbabwe', checkIn: '2025-09-10', checkOut: '2025-09-13', bookingId: 'CHP-28491', verified: true, verifiedDate: '2025-09-14' },
  { id: 's2', userId: 'usr_001', hotel: 'The Silo Hotel', country: 'South Africa', checkIn: '2025-10-02', checkOut: '2025-10-06', bookingId: 'CHP-31204', verified: true, verifiedDate: '2025-10-07' },
  { id: 's3', userId: 'usr_001', hotel: 'Serena Hotel', country: 'Kenya', checkIn: '2025-11-15', checkOut: '2025-11-18', bookingId: 'CHP-34891', verified: true, verifiedDate: '2025-11-19' },
  { id: 's4', userId: 'usr_001', hotel: 'Mandarin Oriental', country: 'Thailand', checkIn: '2026-01-08', checkOut: '2026-01-12', bookingId: 'CHP-40122', verified: true, verifiedDate: '2026-01-13' },
  { id: 's5', userId: 'usr_001', hotel: 'Park Hyatt', country: 'Japan', checkIn: '2026-02-20', checkOut: '2026-02-24', bookingId: 'CHP-43567', verified: true, verifiedDate: '2026-02-25' },
]

const INITIAL_TEST_MISSIONS = [
  { 
    id: 'tm1', 
    title: 'Bangkok Explorer Flow Test', 
    city: 'Bangkok', 
    destination: 'Thailand',
    hotel: 'The Standard, Bangkok Mahanakhon', 
    support: ['3-night hotel stay', 'Meal stipend ($50/day)', 'Local transport card'], 
    requirements: ['Verified status', 'Previous stays in SE Asia', 'Daily field reports'], 
    duration: '3 Days', 
    status: 'open', 
    image: 'bangkok',
    description: 'Test the seamless booking and arrival flow for the new Cheaply partner hotel in Bangkok. Document the co-working facilities and local explorer meetup spots nearby.'
  },
  { 
    id: 'tm2', 
    title: 'Lisbon Co-living Integration', 
    city: 'Lisbon', 
    destination: 'Portugal',
    hotel: 'Selina Secret Garden', 
    support: ['7-night stay', 'Access to coworking', 'Community dinner'], 
    requirements: ['Digital Nomad background', 'Active participation score > 80'], 
    duration: '7 Days', 
    status: 'open', 
    image: 'lisbon',
    description: 'Evaluate the community integration and workspace quality at Selina Lisbon. Share insights on the local nomad scene and coordination tools.'
  }
]

const INITIAL_MISSIONS = [
  { id: 'm1', title: 'East Africa Creator Circuit', type: 'Creator Trip', description: 'A 10-day journey through Kenya, Tanzania, and Ethiopia — documenting cultures, landscapes and the creator economy across East Africa.', leader: 'Tariro Moyo', leaderId: 'usr_001', countries: ['Kenya', 'Tanzania', 'Ethiopia'], startDate: '2026-06-15', endDate: '2026-06-25', maxParticipants: 12, participants: ['usr_001'], interested: [], status: 'open', image: 'africa', joiningDeadline: '2026-06-01' },
  { id: 'm2', title: 'Southeast Asia Nomad Meetup', type: 'Startup Nomad', description: 'Connect with digital nomads and startup founders across Bangkok, Bali and Ho Chi Minh City. Co-working, networking and cultural immersion.', leader: 'Alex Chen', leaderId: 'usr_002', countries: ['Thailand', 'Indonesia', 'Vietnam'], startDate: '2026-07-01', endDate: '2026-07-14', maxParticipants: 20, participants: ['usr_002'], interested: ['usr_001'], status: 'open', image: 'asia', joiningDeadline: '2026-06-15' },
  { id: 'm3', title: 'Morocco Photography Expedition', type: 'Photography', description: 'Capture the medinas, deserts and mountains of Morocco through a photographer\'s lens. From Marrakech to Chefchaouen.', leader: 'Fatima El-Amin', leaderId: 'usr_003', countries: ['Morocco'], startDate: '2026-08-10', endDate: '2026-08-18', maxParticipants: 8, participants: ['usr_003'], interested: [], status: 'open', image: 'morocco', joiningDeadline: '2026-08-01' },
  { id: 'm4', title: 'Lisbon to Porto Cultural Trail', type: 'Cultural Expedition', description: 'Walk the cultural corridor between Portugal\'s two great cities. Art, architecture, food and community.', leader: 'Maria Santos', leaderId: 'usr_004', countries: ['Portugal'], startDate: '2026-09-05', endDate: '2026-09-12', maxParticipants: 15, participants: ['usr_004'], interested: ['usr_001'], status: 'open', image: 'europe', joiningDeadline: '2026-08-25' },
]

const INITIAL_FEED = [
  { id: 'f1', type: 'verified_stay', user: 'Tariro Moyo', avatar: 'TM', text: 'verified a stay at Park Hyatt, Tokyo', timestamp: '2026-02-25T10:00:00Z', country: 'Japan' },
  { id: 'f2', type: 'mission_launch', user: 'Tariro Moyo', avatar: 'TM', text: 'launched the East Africa Creator Circuit mission', timestamp: '2026-03-01T14:00:00Z', country: 'Kenya' },
  { id: 'f_post_1', type: 'user_post', user: 'Alex Chen', avatar: 'AC', text: 'Just arrived in Bangkok! The energy at the night markets is incredible. Anyone around for a startup meetup tomorrow?', timestamp: '2026-05-12T10:00:00Z', country: 'Thailand', likes: 12, comments: [{ id: 'c1', user: 'Tariro Moyo', text: 'Nice! Have fun there.' }] },
  { id: 'f3', type: 'milestone', user: 'Alex Chen', avatar: 'AC', text: 'reached Pathfinder level — 10 countries explored', timestamp: '2026-03-05T09:00:00Z', country: '' },
  { id: 'f4', type: 'verified_stay', user: 'Fatima El-Amin', avatar: 'FE', text: 'verified a stay at La Mamounia, Marrakech', timestamp: '2026-03-10T16:00:00Z', country: 'Morocco' },
]

const INITIAL_MESSAGES = [
  { id: 'm_1', from: 'Alex Chen', to: 'Tariro Moyo', text: 'Hey Tariro! Saw your mission to East Africa. I might be interested in joining for the Kenya leg.', timestamp: '2026-05-12T14:30:00Z' }
]

const FUND_DATA = {
  totalRevenue: 124500,
  fundAllocation: 18675,
  percentAllocated: 15,
  breakdown: [
    { category: 'Explorer Gatherings', amount: 7470, percent: 40, description: 'Funding meetups, co-working events and community gatherings in cities across the network.' },
    { category: 'Mission Support', amount: 5602, percent: 30, description: 'Subsidizing verified missions — covering logistics, venues and coordination costs.' },
    { category: 'Community Initiatives', amount: 3735, percent: 20, description: 'Supporting local projects, cultural exchanges and explorer-led community programs.' },
    { category: 'Travel Coordination', amount: 1868, percent: 10, description: 'Platform development for movement tracking, verification and coordination tools.' },
  ],
  recentAllocations: [
    { title: 'East Africa Creator Circuit — Venue Support', amount: 1200, date: '2026-03-01' },
    { title: 'Lisbon Explorer Gathering — March 2026', amount: 800, date: '2026-03-10' },
    { title: 'Nairobi Co-Working Community Space', amount: 1500, date: '2026-02-15' },
    { title: 'Bangkok Nomad Meetup Series', amount: 600, date: '2026-02-01' },
  ]
}

export function DataProvider({ children }) {
  const [stays, setStays] = useState(INITIAL_STAYS)
  const [missions, setMissions] = useState(INITIAL_MISSIONS)
  const [feed, setFeed] = useState(INITIAL_FEED)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [groupChats, setGroupChats] = useState([])
  const [discussions, setDiscussions] = useState({
    'kenya': [
      { id: 'dis_1', user: 'Alex Chen', text: 'Anyone in Nairobi for the tech meetup next week?', timestamp: '2026-05-12T10:00:00Z' },
      { id: 'dis_2', user: 'Fatima El-Amin', text: 'I am! Let"s coordinate in the mission group.', timestamp: '2026-05-12T11:00:00Z', parentId: 'dis_1' }
    ],
    'thailand': [
      { id: 'dis_3', user: 'Tariro Moyo', text: 'Recommended spots in Chiang Mai for digital nomads?', timestamp: '2026-05-11T15:00:00Z' }
    ]
  })
  const [testMissions, setTestMissions] = useState(INITIAL_TEST_MISSIONS)
  const [testMissionApplications, setTestMissionApplications] = useState([])
  const [userVouches, setUserVouches] = useState({})
  const [fund] = useState(FUND_DATA)

  // Aggregate popular countries from stays + active discussions
  const destinations = (() => {
    const counts = {}
    stays.forEach(s => {
      if (s.verified) {
        counts[s.country] = (counts[s.country] || 0) + 1
      }
    })
    
    // Ensure countries with discussions are included
    Object.keys(discussions).forEach(countryName => {
      const formattedName = countryName.charAt(0).toUpperCase() + countryName.slice(1)
      if (!counts[formattedName]) {
        counts[formattedName] = 0
      }
    })

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, staysCount]) => ({
        id: name.toLowerCase(),
        name,
        staysCount,
        explorers: Math.ceil(staysCount * 1.5) || 0,
        discussionsCount: discussions[name.toLowerCase()]?.length || 0,
        description: `Explore the movement in ${name}. Verified stays and explorer coordination hub.`
      }))
  })()

  const submitStay = (stay) => {
    const newStay = { ...stay, id: 's' + Date.now(), verified: false, verifiedDate: null }
    setStays(prev => [newStay, ...prev])
    setFeed(prev => [{
      id: 'f' + Date.now(), type: 'stay_submitted',
      user: stay.userName || 'Explorer', avatar: stay.userAvatar || 'EX',
      text: `submitted a stay at ${stay.hotel} for verification`,
      timestamp: new Date().toISOString(), country: stay.country
    }, ...prev])
    return newStay
  }

  const likePost = (postId) => {
    setFeed(prev => prev.map(item => {
      if (item.id === postId) return { ...item, likes: (item.likes || 0) + 1 }
      return item
    }))
  }

  const addComment = (postId, comment) => {
    setFeed(prev => prev.map(item => {
      if (item.id === postId) return { ...item, comments: [...(item.comments || []), comment] }
      return item
    }))
  }

  const createPost = (post) => {
    const newPost = {
      id: 'f' + Date.now(),
      type: 'user_post',
      user: post.user,
      avatar: post.avatar,
      text: post.text,
      timestamp: new Date().toISOString(),
      country: post.country || '',
      image: post.image || null,
      flair: post.flair || null,
      likes: 0,
      comments: []
    }
    setFeed(prev => [newPost, ...prev])
  }

  const sendMessage = (msg) => {
    const newMsg = { ...msg, id: 'm_' + Date.now(), timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, newMsg])
  }

  const sendGroupMessage = (groupId, msg) => {
    const newMsg = { ...msg, id: 'gm_' + Date.now(), timestamp: new Date().toISOString() }
    setGroupChats(prev => prev.map(gc => {
      if (gc.id === groupId) return { ...gc, messages: [...gc.messages, newMsg] }
      return gc
    }))
  }

  const importPastHistory = (history, user, updateUser) => {
    // history: { countriesCount: 0, staysCount: 0 }
    updateUser({
      countriesCount: (user.countriesCount || 0) + (history.countriesCount || 0),
      staysCount: (user.staysCount || 0) + (history.staysCount || 0),
      xp: (user.xp || 0) + (history.countriesCount * 100) + (history.staysCount * 50)
    })

    setFeed(prev => [{
      id: 'f' + Date.now(), type: 'milestone',
      user: user.name, avatar: user.avatar,
      text: `imported ${history.countriesCount} countries from their travel history`,
      timestamp: new Date().toISOString(), country: ''
    }, ...prev])
  }

  const createMission = (mission) => {
    const missionId = 'm' + Date.now()
    const newMission = { ...mission, id: missionId, participants: [mission.leaderId], interested: [], status: 'open' }
    setMissions(prev => [newMission, ...prev])
    
    // Create automatic mission group chat
    const newGroupChat = {
      id: 'gc_' + missionId,
      missionId: missionId,
      title: `${mission.title} Coordination`,
      participants: [mission.leaderId],
      messages: [{
        id: 'gm_init',
        from: 'System',
        text: `Welcome to the ${mission.title} coordination group. Participants will be added as they join.`,
        timestamp: new Date().toISOString()
      }]
    }
    setGroupChats(prev => [newGroupChat, ...prev])

    setFeed(prev => [{
      id: 'f' + Date.now(), type: 'mission_launch',
      user: mission.leader, avatar: mission.leaderAvatar || 'EX',
      text: `launched the ${mission.title} mission`,
      timestamp: new Date().toISOString(), country: mission.countries?.[0] || ''
    }, ...prev])
    return newMission
  }

  const joinMission = (missionId, userId, userName, userAvatar) => {
    setMissions(prev => prev.map(m => {
      if (m.id === missionId && !m.participants.includes(userId)) {
        const isFull = m.participants.length >= m.maxParticipants
        const isPastDeadline = m.joiningDeadline && new Date() > new Date(m.joiningDeadline)
        
        if (isFull || isPastDeadline) return m
        return { ...m, participants: [...m.participants, userId] }
      }
      return m
    }))
    
    const mission = missions.find(m => m.id === missionId)
    if (!mission) return

    const isFull = mission.participants.length >= mission.maxParticipants
    const isPastDeadline = mission.joiningDeadline && new Date() > new Date(mission.joiningDeadline)
    if (isFull || isPastDeadline) return

    // Add to group chat
    setGroupChats(prev => prev.map(gc => {
      if (gc.missionId === missionId && !gc.participants.includes(userId)) {
        return { ...gc, participants: [...gc.participants, userId] }
      }
      return gc
    }))

    setFeed(prev => [{
      id: 'f' + Date.now(), type: 'mission_join',
      user: userName, avatar: userAvatar || 'EX',
      text: `joined the ${mission.title} mission`,
      timestamp: new Date().toISOString(), country: mission.countries?.[0] || ''
    }, ...prev])
  }

  const vouchUser = (vouchData) => {
    // vouchData: { fromId, fromName, fromAvatar, toId, toName, missionId?, comment }
    
    // Prevent self-vouching
    if (vouchData.fromId === vouchData.toId) return

    setUserVouches(prev => ({
      ...prev,
      [vouchData.toId]: (prev[vouchData.toId] || 0) + 1
    }))

    setFeed(prev => [{
      id: 'f' + Date.now(), type: 'milestone',
      user: vouchData.fromName, avatar: vouchData.fromAvatar,
      text: `vouched for ${vouchData.toName} — "Verified explorer, great mission partner."`,
      timestamp: new Date().toISOString(), country: ''
    }, ...prev])
  }

  const reportUser = (reportData) => {
    // simulated report logic
    console.log('User reported:', reportData)
  }

  const postToDiscussion = (countryId, post) => {
    // post: { user, text, parentId? }
    const newPost = { ...post, id: 'dis_' + Date.now(), timestamp: new Date().toISOString() }
    setDiscussions(prev => ({
      ...prev,
      [countryId]: [...(prev[countryId] || []), newPost]
    }))
  }

  const startDiscussion = (countryName) => {
    const countryId = countryName.toLowerCase()
    if (!discussions[countryId]) {
      setDiscussions(prev => ({
        ...prev,
        [countryId]: []
      }))
    }
    return countryId
  }

  const applyToTestMission = (application) => {
    const newApp = { ...application, id: 'tma' + Date.now(), status: 'pending', timestamp: new Date().toISOString() }
    setTestMissionApplications(prev => [...prev, newApp])
    return newApp
  }

  const updateTestMissionApplicationStatus = (appId, status) => {
    setTestMissionApplications(prev => prev.map(app => app.id === appId ? { ...app, status } : app))
    
    const app = testMissionApplications.find(a => a.id === appId)
    if (status === 'approved' && app) {
      const mission = testMissions.find(m => m.id === app.missionId)
      if (mission) {
        setFeed(prev => [{
          id: 'f' + Date.now(), type: 'mission_update',
          user: 'System', avatar: 'W',
          text: `${app.userName} has been selected for the ${mission.title} field programme`,
          timestamp: new Date().toISOString(), country: mission.destination
        }, ...prev])
      }
    }
  }

  const submitTestMissionReport = (report) => {
    // report: { missionId, userId, userName, userAvatar, text, image, city }
    setFeed(prev => [{
      id: 'f' + Date.now(), type: 'test_mission_report',
      user: report.userName, avatar: report.userAvatar,
      text: `published a field report from the ${report.missionTitle} mission in ${report.city}: "${report.text}"`,
      timestamp: new Date().toISOString(), country: report.city,
      image: report.image
    }, ...prev])
  }

  return (
    <DataContext.Provider value={{ 
      stays, missions, testMissions, testMissionApplications, userVouches, feed, fund, destinations, messages, groupChats, discussions,
      submitStay, createMission, joinMission, applyToTestMission, updateTestMissionApplicationStatus, submitTestMissionReport,
      createPost, sendMessage, sendGroupMessage, importPastHistory,
      likePost, addComment, vouchUser, reportUser, postToDiscussion, startDiscussion
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
