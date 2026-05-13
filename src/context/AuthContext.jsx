import { createContext, useContext, useState, useEffect } from 'react'
import { insforge } from '../lib/insforge.js'

const AuthContext = createContext({ user: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function hydrateAuth() {
      const { data, error } = await insforge.auth.getCurrentUser()
      if (cancelled) return
      setUser(error ? null : (data?.user ?? null))
      setLoading(false)
    }

    void hydrateAuth()

    return () => { cancelled = true }
  }, [])

  const login = async (email, password) => {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password })
    if (!error) setUser(data.user)
    return { success: !error, error }
  }

  const signup = async (name, email, password) => {
    const { data, error } = await insforge.auth.signUp({ 
      email, 
      password,
      options: { data: { name } }
    })
    if (!error && data?.user) setUser(data.user)
    return { success: !error, error, data }
  }

  const logout = async () => {
    await insforge.auth.signOut()
    setUser(null)
  }

  const loginWithGoogle = async () => {
    const { error } = await insforge.auth.signInWithOAuth({
      provider: 'google',
      redirectTo: window.location.origin + '/profile'
    })
    return { success: !error, error }
  }

  const updateUser = (updates) => {
    setUser({ ...user, user_metadata: { ...user?.user_metadata, ...updates }})
    // Ideally this would also trigger a backend update via setProfile or DB update
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
