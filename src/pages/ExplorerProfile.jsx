import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { Globe, Shield, Star, Heart, Calendar, Compass, MapPin, ArrowLeft, MessageSquare, AlertTriangle, Instagram, Youtube, Music2 } from 'lucide-react'

export default function ExplorerProfile() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const { stays, vouchUser, reportUser, userVouches, feed } = useData()
  const vouchesMap = userVouches || {}
  const [vouched, setVouched] = useState(false)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setProfile(data)
      } else {
        setProfile(null)
      }
      setLoading(false)
    }
    if (id) fetchProfile()
  }, [id])

  if (id === currentUser?.id) return <Navigate to="/profile" />

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading profile...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
          <Link to="/feed" className="nav-link" style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={16} /> Back to Feed
          </Link>
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Globe size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
            <p>Explorer not found.</p>
          </div>
        </div>
      </div>
    )
  }

  const explorerStays = stays.filter(s => s.userId === id && s.verified)

  const explorerPosts = feed
    .filter(f => f.userId === id && f.type === 'user_post')
    .slice(0, 5)

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <Link to="/feed" className="nav-link" style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeft size={16} /> Back to Feed
        </Link>

        {/* Profile Header */}
        <div className="glass-card animate-fade-up" style={{ padding: '48px 40px', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap', position: 'relative' }}>
            <div style={{ width: 100, height: 100, borderRadius: 28, background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: '#0a0b0f', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
              {profile.avatar_url?.startsWith('http') || profile.avatar_url?.startsWith('data:') ? (
                <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 28 }} />
              ) : (
                profile.avatar_url || (profile.full_name?.charAt(0).toUpperCase()) || 'U'
              )}
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h1 style={{ fontSize: '1.8rem' }}>{profile.full_name || 'Explorer'}</h1>
                  {profile.username && <div style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.9rem' }}>@{profile.username}</div>}
                  <span className="badge badge-gold">{profile.level_title || 'Explorer'}</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => {
                      if (vouched) return
                      vouchUser({ fromId: currentUser.id, fromName: currentUser?.full_name, fromAvatar: currentUser?.avatar_url, toId: profile.id, toName: profile.full_name })
                      setVouched(true)
                    }}
                    className={`btn-primary btn-small ${vouched ? 'vouched' : ''}`}
                    disabled={vouched}
                    style={vouched ? { background: 'var(--accent-gold)', borderColor: 'var(--accent-gold)' } : {}}
                  >
                    <Heart size={14} fill={vouched ? 'white' : 'none'} /> {vouched ? 'Vouched' : 'Vouch'}
                  </button>
                  <button onClick={() => reportUser({ to: profile.id })} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <AlertTriangle size={20} />
                  </button>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.95rem' }}>{profile.bio || 'No bio yet.'}</p>

              {profile.socials && (
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  {profile.socials.instagram && <a href={profile.socials.instagram} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}><Instagram size={18} /></a>}
                  {profile.socials.tiktok && <a href={profile.socials.tiktok} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}><Music2 size={18} /></a>}
                  {profile.socials.youtube && <a href={profile.socials.youtube} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}><Youtube size={18} /></a>}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> Joined {profile.joined_date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Compass size={14} /> Level {profile.level}</span>
                {profile.home_country && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} style={{ color: 'var(--accent-gold)' }} /> From {profile.home_country}</span>
                )}
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
            { icon: <Globe size={20} />, value: profile.countries_count || 0, label: 'Countries', color: 'var(--accent-gold)' },
            { icon: <Shield size={20} />, value: profile.stays_count || 0, label: 'Verified Stays', color: 'var(--accent-blue)' },
            { icon: <Heart size={20} />, value: (profile.vouches_count || 0) + (vouchesMap[id] || 0), label: 'Vouches', color: 'var(--accent-rose)' },
            { icon: <Star size={20} />, value: profile.missions_count || 0, label: 'Missions', color: 'var(--accent-purple)' },
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
          {profile.countries && profile.countries.length > 0 && (
            <div className="glass-card" style={{ padding: 32 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={18} style={{ color: 'var(--accent-gold)' }} /> Countries Explored
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.countries.map((c, i) => (
                  <span key={i} style={{ padding: '6px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 100, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="glass-card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={18} style={{ color: 'var(--accent-teal)' }} /> Recent Posts
            </h3>
            {explorerPosts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {explorerPosts.map(p => (
                  <div key={p.id} style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>{p.text}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span><Heart size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />{p.likes || 0}</span>
                      <span><MessageSquare size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />{p.comments?.length || 0}</span>
                      <span>{new Date(p.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No posts yet.</p>
            )}
          </div>
        </div>

        {/* Movement Timeline */}
        {explorerStays.length > 0 && (
          <div className="glass-card" style={{ padding: 32, marginTop: 32 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} style={{ color: 'var(--accent-teal)' }} /> Verified Stays
            </h3>
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
        )}
      </div>
    </div>
  )
}
