import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Globe, ArrowRight } from 'lucide-react'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (mode === 'signup') {
      if (!name || !email || !password) return setError('All fields required')
      const res = signup(name, email, password)
      if (res.success) navigate('/profile')
    } else {
      if (!email || !password) return setError('Email and password required')
      const res = login(email, password)
      if (res.success) navigate('/profile')
      else setError('Invalid credentials')
    }
  }

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 440, width: '100%', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Globe size={28} color="#0a0b0f" />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>
            {mode === 'login' ? 'Welcome Back, Explorer' : 'Join the Network'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {mode === 'login' ? 'Sign in to your explorer identity.' : 'Create your explorer identity and start building. Joining is free.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 36 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="explorer@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            {error && <div style={{ color: '#f87171', fontSize: '0.85rem' }}>{error}</div>}

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {mode === 'login' ? 'Sign In' : 'Join the Network — Free'} <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already an explorer? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{ color: 'var(--accent-gold)', textDecoration: 'underline', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Join the Network' : 'Sign In'}
          </button>
        </p>

        <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Demo: tariro@example.com / explorer123
        </p>
      </div>
    </div>
  )
}
