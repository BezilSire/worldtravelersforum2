import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Globe, Shield, Star, Heart, Calendar, Compass, ArrowLeft, MessageSquare, AlertTriangle, Instagram, Youtube, Music2 } from 'lucide-react'

export default function ExplorerProfile() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const { stays, vouchUser, reportUser, userVouches } = useData()
  const vouchesMap = userVouches || {}
  const [vouched, setVouched] = useState(false)

  // Simulate user data for the ID
  // In a real app, this would be fetched from a DB
  const explorer = {
    id,
    name: id === 'usr_002' ? 'Alex Chen' : `Explorer ${id.slice(-3)}`,
    avatar: id === 'usr_002' ? 'AC' : 'EX',
    bio: 'Dedicated explorer and movement contributor. Moving through the network with purpose.',
    joinedDate: '2025-09-20',
    level: 3,
    levelTitle: 'Navigator',
    countriesCount: 8,
    staysCount: 12,
    vouchesCount: 5 + (vouchesMap[id] || 0),
    missionsCount: 2,
    countries: ['Thailand', 'Vietnam', 'Indonesia', 'Malaysia'],
  }

  if (id === currentUser?.id) return <Navigate to="/profile" />

  const explorerStays = stays.filter(s => s.userId === id && s.verified)

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <Link to={-1} className="nav-link" style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeft size={16} /> Back
        </Link>

        {/* Profile Header */}
        <div className="glass-card animate-fade-up" style={{ padding: '48px 40px', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap', position: 'relative' }}>
            <div style={{ width: 100, height: 100, borderRadius: 28, background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: '#0a0b0f', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
              {explorer.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h1 style={{ fontSize: '1.8rem' }}>{explorer.name}</h1>
                  <span className="badge badge-gold">{explorer.levelTitle}</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    onClick={() => {
                      if (vouched) return
                      vouchUser({ fromId: currentUser.id, fromName: currentUser.name, fromAvatar: currentUser.avatar, toId: explorer.id, toName: explorer.name })
                      setVouched(true)
                    }} 
                    className={`btn-primary btn-small ${vouched ? 'vouched' : ''}`}
                    disabled={vouched}
                    style={vouched ? { background: '#ff4d6d', borderColor: '#ff4d6d' } : {}}
                  >
                    <Heart size={14} fill={vouched ? 'white' : 'none'} /> {vouched ? 'Vouched' : 'Vouch'}
                  </button>
                  <button onClick={() => reportUser({ to: explorer.id })} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <AlertTriangle size={20} />
                  </button>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.95rem' }}>{explorer.bio}</p>
              
              {/* Socials Display */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <a href="#" style={{ color: 'var(--text-muted)' }}><Instagram size={18} /></a>
                <a href="#" style={{ color: 'var(--text-muted)' }}><Music2 size={18} /></a>
                <a href="#" style={{ color: 'var(--text-muted)' }}><Youtube size={18} /></a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> Joined {explorer.joinedDate}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Compass size={14} /> Level {explorer.level}</span>
              </div>
              
              <Link to="/messages" className="btn-secondary btn-small">
                <MessageSquare size={14} /> Send Message
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-4 animate-fade-up animate-delay-1" style={{ marginBottom: 32 }}>
          {[
            { icon: <Globe size={20} />, value: explorer.countriesCount, label: 'Countries', color: 'var(--accent-gold)' },
            { icon: <Shield size={20} />, value: explorer.staysCount, label: 'Verified Stays', color: 'var(--accent-blue)' },
            { icon: <Heart size={20} />, value: explorer.vouchesCount, label: 'Vouches', color: 'var(--accent-rose)' },
            { icon: <Star size={20} />, value: explorer.missionsCount, label: 'Missions', color: 'var(--accent-purple)' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color, fontSize: '2rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          {/* Countries */}
          <div className="glass-card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20 }}>Countries Explored</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {explorer.countries.map((c, i) => (
                <span key={i} style={{ padding: '6px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 100, fontSize: '0.85rem' }}>{c}</span>
              ))}
            </div>
          </div>

          {/* Movement */}
          <div className="glass-card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20 }}>Verified Movement</h3>
            <div className="timeline">
              {explorerStays.map((stay, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot verified" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{stay.hotel}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stay.country}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
