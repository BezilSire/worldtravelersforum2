import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { Link, Navigate } from 'react-router-dom'
import { MapPin, Globe, Shield, Star, Calendar, ArrowRight, Compass, CheckCircle, History, X, Plus, Camera, AlertTriangle, Heart, Instagram, Youtube, Music2, Edit3, LifeBuoy, FileText, Bell, Mountain, MessageSquare, ExternalLink, Trophy } from 'lucide-react'
import { useState, useRef } from 'react'
import { calcReputation } from '../lib/reputation.js'

export default function Profile() {
  const { user, updateUser, checkUsername } = useAuth()
  const { stays, missions, notifications, feed, markNotifRead, importPastHistory, reportUser, userVouches } = useData()
  const [showImport, setShowImport] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [importForm, setImportForm] = useState({ countriesCount: 0, staysCount: 0 })
  const [editForm, setEditForm] = useState({ 
    full_name: user?.full_name || '',
    username: user?.username || '',
    bio: user?.bio || '', 
    home_country: user?.home_country || '',
    tiktok: user?.socials?.tiktok || '', 
    youtube: user?.socials?.youtube || '', 
    instagram: user?.socials?.instagram || '' 
  })
  const [usernameError, setUsernameError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  // if (!user) return <Navigate to="/auth" /> -- handled by ProtectedRoute

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateUser({ profileImage: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const userStays = stays.filter(s => s.userId === user.id)
  const verifiedStays = userStays.filter(s => s.verified)
  const pendingStays = userStays.filter(s => !s.verified)
  const xpPercent = user.xp_next > 0 ? Math.min((user.xp / user.xp_next) * 100, 100) : 0

  const myPosts = feed.filter(f => f.userId === user?.id && f.type === 'user_post')
  const rep = calcReputation({
    countriesCount: user.countries_count || 0,
    staysCount: stays.length,
    postsCount: myPosts.length,
    flightsCount: 0,
    tripReportsCount: 0,
    vouchesCount: (userVouches[user.id] || 0) + (user.vouches_count || 0),
    missionsCount: user.missions_count || 0
  })

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Profile Header */}
        <div className="glass-card animate-fade-up" style={{ padding: '48px 40px', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap', position: 'relative' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ width: 100, height: 100, borderRadius: 28, background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: '#0a0b0f', fontFamily: 'var(--font-display)', overflow: 'hidden', cursor: 'pointer', border: '2px solid var(--border-subtle)' }}
              >
                {user.avatar_url?.startsWith('http') || user.avatar_url?.startsWith('data:') ? (
                  <img src={user.avatar_url} alt={user.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.avatar_url || (user.full_name?.charAt(0).toUpperCase()) || 'U'
                )}
                <div style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--accent-gold)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', border: '3px solid var(--bg-card)' }}>
                  <Camera size={14} />
                </div>
              </div>
              <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
            </div>

            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                  <div>
                    <h1 style={{ fontSize: '1.8rem' }}>{user.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'Explorer'}</h1>
                    {user.username && <div style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.9rem' }}>@{user.username}</div>}
                  </div>
                  <span className="badge badge-gold">{user.level_title}</span>
                </div>
                <button onClick={() => reportUser({ to: user.id, from: 'current_user' })} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }} title="Report User">
                  <AlertTriangle size={20} />
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.95rem', maxWidth: 600 }}>{user.bio || 'No bio yet. Explore the world and build your identity.'}</p>
              
              {/* Socials Display */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                {user.socials?.instagram && (
                  <a href={user.socials.instagram} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}><Instagram size={18} /></a>
                )}
                {user.socials?.tiktok && (
                  <a href={user.socials.tiktok} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}><Music2 size={18} /></a>
                )}
                {user.socials?.youtube && (
                  <a href={user.socials.youtube} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}><Youtube size={18} /></a>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> Joined {user.joined_date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Compass size={14} /> Level {user.level}</span>
                {user.home_country && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} style={{ color: 'var(--accent-gold)' }} /> From {user.home_country}</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowEdit(true)} className="btn-secondary btn-small" style={{ fontSize: '0.75rem' }}>
                  <Edit3 size={14} /> Edit Profile
                </button>
                <button onClick={() => setShowImport(true)} className="btn-secondary btn-small" style={{ fontSize: '0.75rem' }}>
                  <History size={14} /> Import Travel History
                </button>
              </div>

              {/* XP Bar */}
              <div style={{ marginTop: 20, maxWidth: 400 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6, color: 'var(--text-secondary)' }}>
                  <span>{user.xp} XP</span>
                  <span>{user.xp_next} XP to next level</span>
                </div>
                <div className="level-bar-track">
                  <div className="level-bar-fill" style={{ width: `${xpPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-4 animate-fade-up animate-delay-1" style={{ marginBottom: 32 }}>
          {[
            { icon: <Globe size={20} />, value: user.countries_count || 0, label: 'Countries', color: 'var(--accent-gold)' },
            { icon: <Shield size={20} />, value: user.stays_count || 0, label: 'Verified Stays', color: 'var(--accent-blue)' },
            { icon: <Heart size={20} />, value: user.vouches_count || 0, label: 'Vouches', color: 'var(--accent-rose)' },
            { icon: <Star size={20} />, value: user.missions_count || 0, label: 'Missions', color: 'var(--accent-purple)' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color, fontSize: '2rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Reputation Score */}
        <div className="glass-card animate-fade-up animate-delay-1" style={{ padding: 32, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={18} style={{ color: 'var(--accent-gold)' }} /> Explorer Reputation
            </h3>
            <span className="badge badge-gold" style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
              {rep.rank}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Legacy Score</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{rep.legacyScore}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>from {user.countries_count || 0} self-reported {user.countries_count === 1 ? 'country' : 'countries'}</div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Earned Score</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-teal)' }}>{rep.earnedScore}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>from platform actions</div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Score</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rep.totalScore}</span>
            </div>
            <div className="level-bar-track" style={{ height: 8 }}>
              <div className="level-bar-fill" style={{ width: `${Math.min((rep.totalScore / 700) * 100, 100)}%` }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {[
              { label: 'Stays', count: rep.breakdown.stays.count, pts: rep.breakdown.stays.subtotal, icon: <Shield size={14} />, color: 'var(--accent-blue)' },
              { label: 'Flights', count: rep.breakdown.flights.count, pts: rep.breakdown.flights.subtotal, icon: <MapPin size={14} />, color: 'var(--text-muted)' },
              { label: 'Posts', count: rep.breakdown.posts.count, pts: rep.breakdown.posts.subtotal, icon: <MessageSquare size={14} />, color: 'var(--accent-teal)' },
              { label: 'Trip Reports', count: rep.breakdown.tripReports.count, pts: rep.breakdown.tripReports.subtotal, icon: <FileText size={14} />, color: 'var(--text-muted)' },
              { label: 'Vouches', count: rep.breakdown.vouches.count, pts: rep.breakdown.vouches.subtotal, icon: <Heart size={14} />, color: 'var(--accent-rose)' },
              { label: 'Missions', count: rep.breakdown.missions.count, pts: rep.breakdown.missions.subtotal, icon: <Mountain size={14} />, color: 'var(--accent-purple)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: '0.8rem' }}>
                <span style={{ color: item.color }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-secondary)' }}>{item.label}</div>
                  <div style={{ display: 'flex', gap: 6, fontWeight: 600 }}>
                    <span>{item.count}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>× {item.pts}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Activity */}
        <div className="glass-card animate-fade-up" style={{ padding: 32, marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={18} style={{ color: 'var(--accent-teal)' }} /> My Activity
          </h3>
          {(() => {
            const myPosts = feed.filter(f => f.userId === user?.id && f.type === 'user_post')
            const myComments = feed.flatMap(f => (f.comments || []).filter(c => c.userId === user?.id))
            const hasActivity = myPosts.length > 0 || myComments.length > 0
            if (!hasActivity) {
              return <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No activity yet. <Link to="/feed" style={{ color: 'var(--accent-gold)' }}>Share your first travel note</Link> to get started.</p>
            }
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {myPosts.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Heart size={14} /> My Posts ({myPosts.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {myPosts.slice(0, 5).map(p => (
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
                  </div>
                )}
                {myComments.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MessageSquare size={14} /> My Replies ({myComments.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {myComments.slice(0, 5).map(c => {
                        const parentPost = feed.find(f => f.comments?.some(c2 => c2.id === c.id))
                        return (
                          <div key={c.id} style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>{c.text}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {parentPost ? <>on <Link to="/feed" style={{ color: 'var(--accent-gold)' }}>{parentPost.text?.slice(0, 60)}...</Link> · </> : ''}
                              {new Date(c.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                <Link to="/feed" className="btn-secondary btn-small" style={{ alignSelf: 'flex-start' }}>
                  <MessageSquare size={14} /> View All Activity
                </Link>
              </div>
            )
          })()}
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Countries List */}
          <div className="glass-card animate-fade-up animate-delay-2" style={{ padding: 32 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={18} style={{ color: 'var(--accent-gold)' }} /> Countries Explored
            </h3>
            {user.countries && user.countries.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {user.countries.map((c, i) => (
                  <span key={i} style={{ padding: '6px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 100, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No countries yet. <Link to="/claim" style={{ color: 'var(--accent-gold)' }}>Claim your first stay</Link> to start.</p>
            )}
          </div>

          {/* Movement Timeline */}
          <div className="glass-card animate-fade-up animate-delay-3" style={{ padding: 32 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} style={{ color: 'var(--accent-teal)' }} /> Movement Timeline
            </h3>
            {verifiedStays.length > 0 ? (
              <div className="timeline">
                {verifiedStays.slice(0, 5).map((stay, i) => (
                  <div key={i} className="timeline-item">
                    <div className={`timeline-dot ${stay.verified ? 'verified' : ''}`}>
                      {stay.verified && <CheckCircle size={10} color="#0a0b0f" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{stay.hotel}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stay.country}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{stay.checkIn} → {stay.checkOut}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your movement timeline will appear here once stays are verified.</p>
            )}
          </div>
        </div>

        {/* Pending Stays */}
        {pendingStays.length > 0 && (
          <div className="glass-card" style={{ padding: 32, marginTop: 32 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20, color: 'var(--accent-gold)' }}>Pending Verification</h3>
            {pendingStays.map((stay, i) => (
              <div key={i} style={{ padding: '16px 0', borderBottom: i < pendingStays.length - 1 ? '1px solid var(--border-subtle)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{stay.hotel} — {stay.country}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booking ID: {stay.bookingId}</div>
                </div>
                <span className="badge" style={{ background: 'rgba(250,204,21,0.1)', color: '#facc15' }}>Pending</span>
              </div>
            ))}
          </div>
        )}

        {/* Action */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link to="/claim" className="btn-primary"><Shield size={18} /> Claim Another Stay <ArrowRight size={16} /></Link>
        </div>

        {/* My Missions */}
        <div className="glass-card" style={{ padding: 32, marginTop: 32 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mountain size={18} style={{ color: 'var(--accent-purple)' }} /> My Missions
          </h3>
          {(() => {
            const joinedMissions = missions.filter(m => m.participants.includes(user.id))
            if (joinedMissions.length === 0) {
              return <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You haven't joined any missions yet. <Link to="/missions" style={{ color: 'var(--accent-gold)' }}>Explore missions</Link> to get started.</p>
            }
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {joinedMissions.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Led by {m.leader} · {m.participants.length} explorers</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to="/messages" style={{ color: 'var(--accent-teal)' }} title="Mission Chat">
                        <MessageSquare size={16} />
                      </Link>
                      <Link to="/missions" style={{ color: 'var(--text-muted)' }} title="View Mission">
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        {/* Notifications */}
        <div className="glass-card" style={{ padding: 32, marginTop: 32 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} style={{ color: 'var(--accent-gold)' }} /> Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                {notifications.filter(n => !n.read).length} new
              </span>
            )}
          </h3>
          {notifications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notifications.slice(0, 10).map(n => (
                <div
                  key={n.id}
                  onClick={() => markNotifRead(n.id)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: n.read ? 'transparent' : 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    opacity: n.read ? 0.6 : 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{n.title}</div>
                    {n.body && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{n.body}</div>}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(n.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No notifications yet. They'll appear here when you join missions or receive updates.</p>
          )}
        </div>

        {/* Support */}
        <div className="glass-card" style={{ padding: 32, marginTop: 32 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LifeBuoy size={18} style={{ color: 'var(--accent-teal)' }} /> Support
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 12 }}>
            Need help? Reach out to our support team and we'll get back to you.
          </p>
          <a href="mailto:support@worldtravelers.forum" style={{ color: 'var(--accent-gold)', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none' }}>
            support@worldtravelers.forum
          </a>
          <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/privacy" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} /> Privacy Policy
            </Link>
            <Link to="/terms" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} /> Terms & Conditions
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="modal-title" style={{ marginBottom: 0 }}>Edit Explorer Profile</h2>
              <button onClick={() => setShowEdit(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              setUsernameError('');

              if (editForm.username && editForm.username !== user.username) {
                const taken = await checkUsername(editForm.username);
                if (taken) {
                  setUsernameError('This username is already taken.');
                  setSaving(false);
                  return;
                }
              }

              const { success, error } = await updateUser({ 
                full_name: editForm.full_name,
                username: editForm.username.toLowerCase(),
                bio: editForm.bio, 
                home_country: editForm.home_country,
                socials: { 
                  tiktok: editForm.tiktok, 
                  youtube: editForm.youtube, 
                  instagram: editForm.instagram 
                } 
              });

              setSaving(false);
              if (success) setShowEdit(false);
              else setUsernameError(error?.message || 'Failed to update profile.');
            }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} required />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }}>@</span>
                  <input 
                    className="form-input" 
                    style={{ paddingLeft: 32 }}
                    placeholder="explorer_name" 
                    value={editForm.username} 
                    onChange={e => setEditForm({...editForm, username: e.target.value.replace(/[^a-zA-Z0-0_]/g, '')})} 
                  />
                </div>
                {usernameError && <p style={{ color: 'var(--accent-rose)', fontSize: '0.75rem', marginTop: 4 }}>{usernameError}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Home Country</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. United States, Thailand, Germany" 
                  value={editForm.home_country} 
                  onChange={e => setEditForm({...editForm, home_country: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Bio</label>
                  <span style={{ fontSize: '0.7rem', color: editForm.bio.length > 150 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                    {editForm.bio.length} / 160
                  </span>
                </div>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: 80, resize: 'none' }}
                  maxLength={160}
                  value={editForm.bio}
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Share your travel philosophy..."
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label className="form-label" style={{ marginBottom: 4 }}>Social Links</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Instagram size={18} color="var(--text-muted)" />
                  <input className="form-input" placeholder="Instagram URL" value={editForm.instagram} onChange={e => setEditForm({...editForm, instagram: e.target.value})} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Music2 size={18} color="var(--text-muted)" />
                  <input className="form-input" placeholder="TikTok URL" value={editForm.tiktok} onChange={e => setEditForm({...editForm, tiktok: e.target.value})} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Youtube size={18} color="var(--text-muted)" />
                  <input className="form-input" placeholder="YouTube URL" value={editForm.youtube} onChange={e => setEditForm({...editForm, youtube: e.target.value})} />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="modal-overlay" onClick={() => setShowImport(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="modal-title" style={{ marginBottom: 0 }}>Import Travel History</h2>
              <button onClick={() => setShowImport(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
              Don't start from zero. Add countries and cities you've explored in the past to build your initial explorer reputation.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              importPastHistory({
                countriesCount: parseInt(importForm.countriesCount) || 0,
                staysCount: parseInt(importForm.staysCount) || 0
              }, user, updateUser);
              setShowImport(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Number of Countries Explored</label>
                <input className="form-input" type="number" placeholder="e.g. 15" value={importForm.countriesCount} onChange={e => setImportForm({...importForm, countriesCount: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Number of Past Stays</label>
                <input className="form-input" type="number" placeholder="e.g. 24" value={importForm.staysCount} onChange={e => setImportForm({...importForm, staysCount: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <History size={18} /> Update History <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
