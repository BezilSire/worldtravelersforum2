import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { insforge } from '../lib/insforge.js'

const AuthContext = createContext({ user: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const hydrateUser = useCallback(async () => {
    const { data: authData } = await insforge.auth.getCurrentUser()
    
    if (authData?.user) {
      // Fetch profile
      let { data: profile } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      
      if (!profile) {
        const name = authData.user.user_metadata?.full_name || authData.user.user_metadata?.name || 'Explorer'
        const newProfile = {
          id: authData.user.id,
          full_name: name,
          avatar_url: name.charAt(0).toUpperCase(),
          joined_date: new Date().toISOString().split('T')[0]
        }
        await insforge.database.from('profiles').insert(newProfile)
        profile = newProfile
      }
      
      setUser({ ...authData.user, ...profile })
      return true
    } else {
      setUser(null)
      return false
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function initAuth() {
      // Check if this is an OAuth callback (insforge_code in URL)
      const params = new URLSearchParams(window.location.search)
      const oauthCode = params.get('insforge_code')

      if (oauthCode) {
        try {
          // Exchange the OAuth code for a session
          await insforge.auth.exchangeOAuthCode(oauthCode)
          // Clean the URL
          const cleanUrl = window.location.pathname
          window.history.replaceState({}, '', cleanUrl)
        } catch (err) {
          console.error('OAuth code exchange failed:', err)
        }
      }

      if (cancelled) return

      // Now hydrate auth state (will pick up session from exchange above)
      const hasUser = await hydrateUser()
      if (cancelled) return

      setLoading(false)

      // If we just completed OAuth, navigate to profile
      if (oauthCode && hasUser) {
        navigate('/profile', { replace: true })
      }
    }

    void initAuth()

    return () => { cancelled = true }
  }, [hydrateUser, navigate])

  const login = async (email, password) => {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password })
    if (!error && data?.user) {
      const { data: profile } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      setUser({ ...data.user, ...profile })
    }
    return { success: !error, error }
  }

  const signup = async (name, email, password) => {
    const { data, error } = await insforge.auth.signUp({ 
      email, 
      password,
      options: { data: { full_name: name } }
    })
    
    if (!error && data?.user) {
      // Create profile record
      const profileData = {
        id: data.user.id,
        full_name: name,
        avatar_url: name.charAt(0).toUpperCase(),
        joined_date: new Date().toISOString().split('T')[0]
      }
      await insforge.database.from('profiles').insert(profileData)
      setUser({ ...data.user, ...profileData })
    }
    return { success: !error, error, data }
  }

  const logout = async () => {
    await insforge.auth.signOut()
    setUser(null)
  }

  const loginWithGoogle = async () => {
    const { error } = await insforge.auth.signInWithOAuth({
      provider: 'google',
      redirectTo: window.location.origin + '/auth'
    })
    return { success: !error, error }
  }

  const sendResetEmail = async (email) => {
    return await insforge.auth.sendResetPasswordEmail({
      email,
      redirectTo: window.location.origin + '/reset-password'
    })
  }

  const resetPasswordWithCode = async (email, code, newPassword) => {
    const { data, error } = await insforge.auth.exchangeResetPasswordToken({ email, code })
    if (error) return { error }
    return await insforge.auth.resetPassword({ newPassword, otp: data.token })
  }

  const updateUser = async (updates) => {
    const { error } = await insforge.database
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    
    if (!error) {
      setUser({ ...user, ...updates })
    }
    return { success: !error, error }
  }

  const checkUsername = async (username) => {
    if (!username) return false
    const { data } = await insforge.database
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle()
    
    // If we find a user with this username and it's NOT the current user, it's taken
    return data && data.id !== user?.id
  }

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, signup, logout, updateUser, checkUsername,
      loginWithGoogle, sendResetEmail, resetPasswordWithCode 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
