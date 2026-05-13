import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { Link, Navigate } from 'react-router-dom'
import { MapPin, Globe, Shield, Star, Calendar, ArrowRight, Compass, CheckCircle, History, X, Plus, Camera, AlertTriangle, Heart, Instagram, Youtube, Music2, Edit3 } from 'lucide-react'
import { useState, useRef } from 'react'

export default function Profile() {
  const { user, updateUser, checkUsername } = useAuth()
  const { stays, importPastHistory, reportUser } = useData()
  const [showImport, setShowImport] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [importForm, setImportForm] = useState({ countriesCount: 0, staysCount: 0 })
  const [editForm, setEditForm] = useState({ 
    full_name: user?.full_name || '',
    username: user?.username || '',
    bio: user?.bio || '', 
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
