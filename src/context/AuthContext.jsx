import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext({ user: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const hydrateUser = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null)
      return false
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    
    if (!profile) {
      const metaName = authUser.user_metadata?.full_name || authUser.user_metadata?.name
      const emailName = authUser.email?.split('@')[0] || 'User'
      const name = metaName || emailName
      const newProfile = {
        id: authUser.id,
        full_name: name,
        avatar_url: name.charAt(0).toUpperCase(),
        joined_date: new Date().toISOString().split('T')[0]
      }
      const { error: insertErr } = await supabase.from('profiles').insert(newProfile)
      if (insertErr) {
        console.error('Failed to create fallback profile:', insertErr)
      }
      profile = newProfile
    }
    
    setUser({ ...authUser, ...profile })
    return true
  }, [])

  useEffect(() => {
    let cancelled = false

    async function initAuth() {
      const params = new URLSearchParams(window.location.search)
      const oauthCode = params.get('code')

      if (oauthCode) {
        const cleanUrl = window.location.pathname
        window.history.replaceState({}, '', cleanUrl)
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (cancelled) return
          
          if (session?.user) {
            await hydrateUser(session.user)
          } else {
            setUser(null)
          }
          setLoading(false)
        }
      )

      const { data: { session } } = await supabase.auth.getSession()
      if (!cancelled && session?.user) {
        await hydrateUser(session.user)
      }
      if (!cancelled) {
        setLoading(false)
      }

      return () => { subscription.unsubscribe() }
    }

    void initAuth()

    return () => { cancelled = true }
  }, [hydrateUser, navigate])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data?.user) {
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      if (!profile) {
        const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User'
        profile = { id: data.user.id, full_name: name, avatar_url: name.charAt(0).toUpperCase(), joined_date: new Date().toISOString().split('T')[0] }
        await supabase.from('profiles').upsert(profile)
      }
      setUser({ ...data.user, ...profile })
    }
    return { success: !error, error }
  }

  const signup = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { full_name: name } }
    })
    
    if (!error && data?.user) {
      const profileData = {
        id: data.user.id,
        full_name: name,
        avatar_url: name.charAt(0).toUpperCase(),
        joined_date: new Date().toISOString().split('T')[0]
      }
      const { error: profileError } = await supabase.from('profiles').insert(profileData)
      if (profileError) {
        console.error('Profile creation failed:', profileError)
        return { success: false, error: profileError, data }
      }
      setUser({ ...data.user, ...profileData })
    }
    return { success: !error, error, data }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth' }
    })
    return { success: !error, error }
  }

  const sendResetEmail = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    })
  }

  const resetPasswordWithCode = async (_email, _code, newPassword) => {
    return await supabase.auth.updateUser({ password: newPassword })
  }

  const updateUser = async (updates) => {
    const { error } = await supabase
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
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle()
    
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
