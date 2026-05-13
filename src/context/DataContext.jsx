import { createContext, useContext, useState } from 'react'

const DataContext = createContext(null)

const INITIAL_STAYS = []
const INITIAL_TEST_MISSIONS = []
const INITIAL_MISSIONS = []
const INITIAL_FEED = []
const INITIAL_MESSAGES = []

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

export function DataProvider({ children }) {
  const [stays, setStays] = useState(INITIAL_STAYS)
  const [missions, setMissions] = useState(INITIAL_MISSIONS)
  const [feed, setFeed] = useState(INITIAL_FEED)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [groupChats, setGroupChats] = useState([])
  const [discussions, setDiscussions] = useState({})
  const [testMissions, setTestMissions] = useState(INITIAL_TEST_MISSIONS)
  const [testMissionApplications, setTestMissionApplications] = useState([])
  const [userVouches, setUserVouches] = useState({})
  const [fund] = useState(FUND_DATA)

  const destinations = []

  const submitStay = (stay) => {}
  const likePost = (postId) => {}
  const addComment = (postId, comment) => {}
  const createPost = (post) => {}
  const sendMessage = (msg) => {}
  const sendGroupMessage = (groupId, msg) => {}
  const importPastHistory = (history, user, updateUser) => {}
  const createMission = (mission) => {}
  const joinMission = (missionId, userId, userName, userAvatar) => {}
  const vouchUser = (vouchData) => {}
  const reportUser = (reportData) => {}
  const postToDiscussion = (countryId, post) => {}
  const startDiscussion = (countryName) => {}
  const applyToTestMission = (application) => {}
  const updateTestMissionApplicationStatus = (appId, status) => {}
  const submitTestMissionReport = (report) => {}

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
