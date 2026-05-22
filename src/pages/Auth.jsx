import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Globe, ArrowRight, Key, Shield } from 'lucide-react'

export default function Auth() {
  const [mode, setMode] = useState('login') // login, signup, forgot, reset
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { user, loading: authLoading, login, signup, loginWithGoogle, sendResetEmail, resetPasswordWithCode } = useAuth()
  const navigate = useNavigate()

  // If already logged in, redirect to profile
  if (!authLoading && user) {
    return <Navigate to="/profile" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMsg('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (!name || !email || !password) throw new Error('All fields required')
        const res = await signup(name, email, password)
        if (res.success) {
          if (res.data?.requireEmailVerification) {
            setMsg('Please check your email for the verification code.')
          } else {
            navigate('/profile')
          }
        } else {
          throw res.error
        }
      } else if (mode === 'login') {
        if (!email || !password) throw new Error('Email and password required')
        const res = await login(email, password)
        if (res.success) navigate('/profile')
        else throw res.error
      } else if (mode === 'forgot') {
        if (!email) throw new Error('Email required')
        const { error } = await sendResetEmail(email)
        if (error) throw error
        setMsg('Reset code sent to your email.')
        setMode('reset')
      } else if (mode === 'reset') {
        if (!email || !code || !password) throw new Error('All fields required')
        const { error } = await resetPasswordWithCode(email, code, password)
        if (error) throw error
        setMsg('Password reset successful. You can now sign in.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    const res = await loginWithGoogle()
    if (!res.success) setError(res.error?.message || 'Google login failed')
  }

  const renderForm = () => {
    if (mode === 'forgot') {
      return (
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="explorer@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
      )
    }

    if (mode === 'reset') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={email} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">6-Digit Reset Code</label>
            <input className="form-input" type="text" placeholder="123456" value={code} onChange={e => setCode(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {mode === 'signup' && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="explorer@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
            {mode === 'login' && (
              <button type="button" onClick={() => setMode('forgot')} style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Forgot Password?
              </button>
            )}
          </div>
          <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 440, width: '100%', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            {mode === 'forgot' || mode === 'reset' ? <Key size={28} color="#0a0b0f" /> : <Globe size={28} color="#0a0b0f" />}
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>
            {mode === 'login' && 'Welcome Back, Explorer'}
            {mode === 'signup' && 'Join the Network'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'reset' && 'Create New Password'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {mode === 'login' && 'Sign in to your explorer identity.'}
            {mode === 'signup' && 'Create your explorer identity and start building.'}
            {mode === 'forgot' && "Enter your email to receive a reset code."}
            {mode === 'reset' && 'Enter the code from your email and your new password.'}
          </p>
        </div>

        <div style={{ padding: '12px 16px', background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)', borderRadius: 12, marginBottom: 24, fontSize: '0.85rem', color: 'var(--accent-gold)', textAlign: 'center' }}>
          <Shield size={14} style={{ marginRight: 8 }} />
          Platform in Early Access — Existing explorers only
        </div>

        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 36 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {renderForm()}

            {error && <div style={{ color: '#f87171', fontSize: '0.85rem', padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 8 }}>{error}</div>}
            {msg && <div style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', padding: '8px 12px', background: 'rgba(212,168,83,0.1)', borderRadius: 8 }}>{msg}</div>}

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Processing...' : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Join the Network — Free'}
                  {mode === 'forgot' && 'Send Reset Code'}
                  {mode === 'reset' && 'Reset Password'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            
            {(mode === 'login' || mode === 'signup') && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                  <span style={{ padding: '0 12px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                </div>

                <button type="button" onClick={handleGoogleLogin} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <svg style={{width: 18, height: 18, marginRight: 8}} viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z" />
                    <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.823l-4.04 3.067A11.965 11.965 0 0012 24c2.933 0 5.735-1.043 7.839-2.865l-3.8-3.122z" />
                    <path fill="#4A90E2" d="M19.839 21.135C21.95 19.28 23.277 16.369 23.277 12.61c0-.82-.074-1.636-.217-2.433H12v4.608h6.436c-.273 1.558-1.115 2.87-2.397 3.75l3.8 3.122z" />
                    <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 014.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z" />
                  </svg>
                  Continue with Google
                </button>
              </>
            )}
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {mode === 'login' && (
            <>New explorers welcome once the network opens.</>
          )}
          {mode === 'signup' && (
            <>Already an explorer? <button onClick={() => { setMode('login'); setError(''); setMsg('') }} style={{ color: 'var(--accent-gold)', textDecoration: 'underline', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer' }}>Sign In</button></>
          )}
          {(mode === 'forgot' || mode === 'reset') && (
            <button onClick={() => { setMode('login'); setError(''); setMsg('') }} style={{ color: 'var(--accent-gold)', textDecoration: 'underline', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer' }}>Back to Sign In</button>
          )}
        </p>
      </div>
    </div>
  )
}
