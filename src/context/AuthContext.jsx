import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const DEMO_USERS = [
  {
    id: 'usr_001',
    name: 'Tariro Moyo',
    email: 'tariro@example.com',
    password: 'explorer123',
    avatar: 'TM',
    bio: 'Explorer and globally mobile professional. Building a movement through verified travel.',
    joinedDate: '2025-08-15',
    level: 4,
    levelTitle: 'Pathfinder',
    xp: 2400,
    xpNext: 3000,
    countriesCount: 12,
    staysCount: 15,
    missionsCount: 3,
    vouchesCount: 8,
    countries: ['Zimbabwe', 'South Africa', 'Mozambique', 'Tanzania', 'Kenya', 'Ethiopia', 'Morocco', 'Thailand', 'Vietnam', 'Japan', 'Portugal', 'UAE'],
    role: 'explorer',
    socials: {
      tiktok: 'https://tiktok.com/@tariromoyo',
      youtube: 'https://youtube.com/@tariromoyo',
      instagram: 'https://instagram.com/tariromoyo'
    }
  }
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('wtf_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch(e) { localStorage.removeItem('wtf_user') }
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (found) {
      setUser(found)
      localStorage.setItem('wtf_user', JSON.stringify(found))
      return { success: true }
    }
    // Allow any login for demo
    const newUser = {
      id: 'usr_' + Date.now(),
      name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      avatar: email.substring(0, 2).toUpperCase(),
      bio: 'New explorer on the network.',
      joinedDate: new Date().toISOString().split('T')[0],
      level: 1, levelTitle: 'Newcomer',
      xp: 0, xpNext: 500,
      countriesCount: 0, staysCount: 0, missionsCount: 0, vouchesCount: 0,
      countries: [],
      role: 'explorer',
      socials: { tiktok: '', youtube: '', instagram: '' }
    }
    setUser(newUser)
    localStorage.setItem('wtf_user', JSON.stringify(newUser))
    return { success: true }
  }

  const signup = (name, email, password) => {
    const newUser = {
      id: 'usr_' + Date.now(),
      name, email, password,
      avatar: name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
      bio: 'New explorer joining the network.',
      joinedDate: new Date().toISOString().split('T')[0],
      level: 1, levelTitle: 'Newcomer',
      xp: 50, xpNext: 500,
      countriesCount: 0, staysCount: 0, missionsCount: 0,
      countries: [],
      role: 'explorer'
    }
    setUser(newUser)
    localStorage.setItem('wtf_user', JSON.stringify(newUser))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('wtf_user')
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('wtf_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
