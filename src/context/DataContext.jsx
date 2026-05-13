import { createContext, useContext, useState, useEffect } from 'react'
import { insforge } from '../lib/insforge.js'
import { useAuth } from './AuthContext.jsx'

const DataContext = createContext(null)

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
  const { user } = useAuth()
  const [stays, setStays] = useState([])
  const [missions, setMissions] = useState([])
  const [feed, setFeed] = useState([])
  const [messages, setMessages] = useState([])
  const [fund] = useState(FUND_DATA)
  const [loading, setLoading] = useState(true)

  // Fetch Feed
  useEffect(() => {
    async function fetchFeed() {
      const { data, error } = await insforge.database
        .from('posts')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url),
          comments (
            *,
            profiles:user_id (full_name, avatar_url)
          )
        `)
        .order('timestamp', { ascending: false })
      
      if (!error) {
        setFeed(data.map(post => ({
          id: post.id,
          user: post.profiles?.full_name || 'Explorer',
          avatar: post.profiles?.avatar_url || 'E',
          text: post.text,
          image: post.image_url,
          flair: post.flair,
          likes: post.likes_count,
          timestamp: post.timestamp,
          comments: post.comments?.map(c => ({
            id: c.id,
            user: c.profiles?.full_name || 'Explorer',
            avatar: c.profiles?.avatar_url || 'E',
            text: c.text,
            timestamp: c.timestamp
          })) || []
        })))
      }
    }

    fetchFeed()
  }, [])

  // Fetch User Stays
  useEffect(() => {
    if (!user) {
      setStays([])
      return
    }

    async function fetchStays() {
      const { data, error } = await insforge.database
        .from('stays')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
      
      if (!error) setStays(data)
    }

    fetchStays()
  }, [user])

  const submitStay = async (stayData) => {
    if (!user) return
    const { error } = await insforge.database.from('stays').insert({
      user_id: user.id,
      hotel: stayData.hotel,
      country: stayData.country,
      booking_id: stayData.bookingId,
      check_in: stayData.checkIn,
      check_out: stayData.checkOut
    })
    if (!error) {
      // Refresh stays
      const { data } = await insforge.database.from('stays').select('*').eq('user_id', user.id)
      setStays(data)
    }
  }

  const createPost = async (postData) => {
    if (!user) return
    const { error } = await insforge.database.from('posts').insert({
      user_id: user.id,
      text: postData.text,
      image_url: postData.image,
      flair: postData.flair
    })
    if (!error) {
      // In a real app we'd use realtime, for now just refetch or optimistically update
      window.location.reload() // Quickest way to refresh the complex joined query
    }
  }

  const likePost = async (postId) => {
    // Basic like increment
    await insforge.database.rpc('increment_likes', { post_id: postId })
  }

  const addComment = async (postId, comment) => {
    if (!user) return
    await insforge.database.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      text: comment.text
    })
  }

  return (
    <DataContext.Provider value={{ 
      stays, missions, feed, fund, loading,
      submitStay, createPost, likePost, addComment
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
