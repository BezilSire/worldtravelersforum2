import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext({ user: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const navigate = useNavigate()

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

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return
      if (session?.user) {
        await hydrateUser(session.user)
      }
      if (!cancelled) {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return

        if (event === 'PASSWORD_RECOVERY') {
          setPasswordRecovery(true)
          return
        }

        if (session?.user) {
          await hydrateUser(session.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [hydrateUser])

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

      const emailConfirmed = !!data.user.email_confirmed_at

      if (emailConfirmed) {
        const { error: profileError } = await supabase.from('profiles').insert(profileData)
        if (profileError) {
          console.error('Profile creation failed:', profileError)
          return { success: false, error: profileError, data }
        }
        setUser({ ...data.user, ...profileData })
      } else {
        await supabase.from('profiles').upsert(profileData)
      }
    }
    return { success: !error, error, data }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPasswordRecovery(false)
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
      redirectTo: window.location.origin + '/auth'
    })
  }

  const resetPassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) {
      setPasswordRecovery(false)
    }
    return { error }
  }

  const updateUser = async (updates) => {
    if (updates.full_name && user?.avatar_url && 
        !user.avatar_url.startsWith('http') && 
        !user.avatar_url.startsWith('data:')) {
      updates.avatar_url = updates.full_name.charAt(0).toUpperCase()
    }
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
      loginWithGoogle, sendResetEmail, resetPassword, passwordRecovery
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
