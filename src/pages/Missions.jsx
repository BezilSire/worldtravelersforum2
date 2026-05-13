import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { Link } from 'react-router-dom'
import { Mountain, MapPin, Calendar, Users, Plus, ArrowRight, X, Camera, Code, Compass, Globe, MessageSquare, Shield, Heart } from 'lucide-react'

const TYPE_ICONS = { 'Creator Trip': <Camera size={16} />, 'Photography': <Camera size={16} />, 'Startup Nomad': <Code size={16} />, 'Cultural Expedition': <Compass size={16} /> }
const TYPE_COLORS = { 'Creator Trip': 'var(--accent-gold)', 'Photography': 'var(--accent-rose)', 'Startup Nomad': 'var(--accent-teal)', 'Cultural Expedition': 'var(--accent-purple)' }

export default function Missions() {
  const { user } = useAuth()
  const { missions, createMission, joinMission, vouchUser } = useData()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', type: '', description: '', countries: '', startDate: '', endDate: '', maxParticipants: 12, joiningDeadline: '' })
  const [sessionVouches, setSessionVouches] = useState([])

  const handleCreate = (e) => {
    e.preventDefault()
    if (!user || !form.title || !form.description) return
    createMission({
      ...form,
      countries: form.countries.split(',').map(c => c.trim()).filter(Boolean),
      leader: user.name, leaderId: user.id, leaderAvatar: user.avatar,
      image: 'custom'
    })
    setShowCreate(false)
    setForm({ title: '', type: '', description: '', countries: '', startDate: '', endDate: '', maxParticipants: 12, joiningDeadline: '' })
  }

  const handleJoin = (missionId) => {
    if (!user) return
    joinMission(missionId, user.id, user.name, user.avatar)
  }

  const myMissions = missions.filter(m => m.leaderId === user?.id)

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, gap: 20, flexWrap: 'wrap' }}>
          <div className="animate-fade-up">
            <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>Mission <span className="text-gradient">Control</span></h1>
            <p style={{ color: 'var(--text-secondary)' }}>Discover, join and launch global explorer missions.</p>
          </div>
          {user && (
            <button onClick={() => setShowCreate(true)} className="btn-primary animate-fade-up">
              <Plus size={18} /> Launch Mission
            </button>
          )}
        </div>

        {/* My Coordination Dashboard */}
        {myMissions.length > 0 && (
          <div className="animate-fade-up animate-delay-1" style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={20} color="var(--accent-gold)" /> Your Active Coordinations
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {myMissions.map(m => (
                <div key={m.id} className="glass-card" style={{ padding: 24, background: 'var(--accent-gold-glow)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{m.title}</h3>
                    <Link to="/messages" className="btn-secondary btn-small">
                      <MessageSquare size={14} /> Open Group Chat
                    </Link>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    {m.participants.map(pid => (
                      <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                          {pid === user.id ? 'YOU' : 'EX'}
                        </div>
                        <div style={{ flex: 1, fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 600 }}>{pid === user.id ? 'You (Leader)' : `Explorer ${pid.slice(-3)}`}</div>
                        </div>
                        {pid !== user.id && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                              onClick={() => {
                                if (sessionVouches.includes(pid)) return
                                vouchUser({ 
                                  fromId: user.id, fromName: user.name, fromAvatar: user.avatar, 
                                  toId: pid, toName: `Explorer ${pid.slice(-3)}` 
                                })
                                setSessionVouches([...sessionVouches, pid])
                              }} 
                              className="btn-secondary btn-small" 
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '0.7rem',
                                color: sessionVouches.includes(pid) ? '#ff4d6d' : 'inherit',
                                borderColor: sessionVouches.includes(pid) ? '#ff4d6d' : 'inherit'
                              }}
                              disabled={sessionVouches.includes(pid)}
                            >
                              <Heart size={12} fill={sessionVouches.includes(pid) ? '#ff4d6d' : 'none'} /> {sessionVouches.includes(pid) ? 'Vouched' : 'Vouch'}
                            </button>
                            <Link to="/messages" style={{ color: 'var(--text-muted)' }} title="DM Explorer">
                              <MessageSquare size={14} />
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discovery Grid */}
        <h2 style={{ fontSize: '1.2rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }} className="animate-fade-up animate-delay-2">
          <Globe size={20} color="var(--accent-teal)" /> Discovery Missions
        </h2>
        <div className="grid-2">
          {missions.map((mission, i) => {
            const spotsLeft = mission.maxParticipants - mission.participants.length
            const hasJoined = user && (mission.participants.includes(user.id) || mission.interested.includes(user.id))
            const isLeader = user && mission.leaderId === user.id
            const isFull = mission.participants.length >= mission.maxParticipants
            const isPastDeadline = mission.joiningDeadline && new Date() > new Date(mission.joiningDeadline)
            const canJoin = !hasJoined && !isLeader && !isFull && !isPastDeadline

            return (
              <div key={mission.id} className={`glass-card animate-fade-up animate-delay-${Math.min(i + 1, 4)}`} style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span className="badge" style={{ background: `${TYPE_COLORS[mission.type] || 'var(--accent-gold)'}15`, color: TYPE_COLORS[mission.type] || 'var(--accent-gold)' }}>
                    {TYPE_ICONS[mission.type] || <Compass size={14} />} {mission.type}
                  </span>
                  {isLeader && <span className="badge badge-gold">Your Mission</span>}
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: 10 }}>{mission.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6, flex: 1 }}>{mission.description}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Globe size={14} /> {mission.countries.join(', ')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} /> {mission.startDate} → {mission.endDate}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Users size={14} /> {mission.participants.length} explorers joined · {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Mission Full'}
                  </div>
                  {mission.joiningDeadline && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: isPastDeadline ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                      <Calendar size={14} /> Join by: {mission.joiningDeadline} {isPastDeadline && '(Closed)'}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Led by <strong style={{ color: 'var(--text-secondary)' }}>{mission.leader}</strong></div>
                  {user && !isLeader && (
                    hasJoined ? (
                      <span className="badge badge-teal">Joined</span>
                    ) : (
                      <button 
                        onClick={() => handleJoin(mission.id)} 
                        className="btn-primary btn-small"
                        disabled={!canJoin}
                        style={!canJoin ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {isFull ? 'Mission Full' : isPastDeadline ? 'Deadline Passed' : 'Join Mission'} <ArrowRight size={14} />
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Create Mission Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="modal-title" style={{ marginBottom: 0 }}>Create Explorer Mission</h2>
              <button onClick={() => setShowCreate(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Mission Title</label>
                <input className="form-input" placeholder="e.g. West Africa Photography Trail" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mission Type (Custom)</label>
                <input className="form-input" placeholder="e.g. Solo Expedition, Beach Cleanup..." value={form.type} onChange={e => setForm({...form, type: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" placeholder="Describe the mission..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Countries (comma separated)</label>
                <input className="form-input" placeholder="Kenya, Tanzania" value={form.countries} onChange={e => setForm({...form, countries: e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Max People</label>
                  <input className="form-input" type="number" min="1" value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: parseInt(e.target.value)})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Joining Deadline</label>
                  <input className="form-input" type="date" value={form.joiningDeadline} onChange={e => setForm({...form, joiningDeadline: e.target.value})} required />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-input" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Mountain size={18} /> Launch Mission <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
