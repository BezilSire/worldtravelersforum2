import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import {
  ArrowLeft, Calendar, Clock, Globe, Users, MapPin, MessageSquare, Shield, Plus, X, Check,
  Send, Edit3, Trash2, ThumbsUp, Reply, ChevronDown, ChevronUp, Link as LinkIcon, ListTodo,
  Mountain, Lock, Unlock, Image as ImageIcon, Flag, Copy, ExternalLink, MoreHorizontal
} from 'lucide-react'

const INITIAL_MSGS = 30

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function groupByDate(items) {
  const groups = []
  let currentDate = null
  let currentGroup = []
  for (const item of items) {
    const d = formatDate(item.timestamp)
    if (d !== currentDate) {
      if (currentGroup.length) groups.push({ date: currentDate, items: currentGroup })
      currentDate = d
      currentGroup = [item]
    } else {
      currentGroup.push(item)
    }
  }
  if (currentGroup.length) groups.push({ date: currentDate, items: currentGroup })
  return groups
}

function Avatar({ name, url, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, flexShrink: 0,
      background: 'var(--bg-elevated)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${Math.round(size * 0.42)}px`, fontWeight: 700,
      color: 'var(--accent-teal)', overflow: 'hidden'
    }}>
      {url?.startsWith('http') || url?.startsWith('data:') ? (
        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        (name || '?').charAt(0).toUpperCase()
      )}
    </div>
  )
}

function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
}

export default function MissionDetail() {
  const { missionId } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const {
    missions, groupChats, allProfiles,
    joinMission, leaveMission, updateMission,
    sendGroupMessage, editMessage, deleteMessage, reactToMessage
  } = useData()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'chat' ? 'chat' : 'overview')
  const [joinTypeMenu, setJoinTypeMenu] = useState(false)

  // Chat state
  const [msgText, setMsgText] = useState('')
  const [editingMsg, setEditingMsg] = useState(null)
  const [msgLimit, setMsgLimit] = useState(INITIAL_MSGS)
  const [reactionPicker, setReactionPicker] = useState(null)
  const listRef = useRef(null)

  // Plan state
  const [newCheckItem, setNewCheckItem] = useState('')
  const [newScheduleItem, setNewScheduleItem] = useState({ day: '', time: '', activity: '' })
  const [newResource, setNewResource] = useState({ title: '', url: '' })
  const [newRule, setNewRule] = useState('')

  const mission = missions.find(m => m.id === missionId)
  const chat = useMemo(() => groupChats.find(gc => gc.missionId === missionId), [groupChats, missionId])
  const messages = useMemo(() => {
    const msgs = chat?.messages || []
    return [...msgs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }, [chat])
  const visibleMessages = messages.slice(-msgLimit)
  const messageGroups = useMemo(() => groupByDate(visibleMessages), [visibleMessages])
  const isLeader = user && mission?.leaderId === user.id
  const hasJoined = user && mission?.participants?.includes(user.id)
  const isFull = mission ? mission.participants.length >= mission.maxParticipants : false
  const isPastDeadline = mission?.joiningDeadline && new Date() > new Date(mission.joiningDeadline)
  const canJoin = !hasJoined && !isFull && !isPastDeadline && mission?.joinType !== 'invite'

  const participantProfiles = useMemo(() => {
    if (!mission) return []
    return mission.participants.map(pid => {
      const p = allProfiles.find(prof => prof.id === pid)
      return { id: pid, name: p?.full_name || `Explorer ${pid.slice(-3)}`, avatar: p?.avatar_url, home: p?.home_country, isYou: pid === user?.id }
    })
  }, [mission, allProfiles, user])

  const scrollToBottom = () => {
    setTimeout(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
    }, 50)
  }

  useEffect(() => { scrollToBottom() }, [messages.length])

  const handleSend = (e) => {
    e.preventDefault()
    if (!msgText.trim() || !user || !chat) return
    sendGroupMessage(chat.id, { from: { name: user.full_name, id: user.id }, text: msgText })
    setMsgText('')
  }

  const handleEditMsg = (msgId, newText) => {
    if (!newText.trim()) return
    editMessage(msgId, newText, 'group')
    setEditingMsg(null)
  }

  const handleDeleteMsg = (msgId) => {
    deleteMessage(msgId, 'group')
  }

  const handleReact = (msgId, emoji) => {
    reactToMessage(msgId, emoji, 'group')
    setReactionPicker(null)
  }

  const handleJoin = () => {
    if (!user) return
    if (mission.joinType === 'approval') {
      // For approval type, send a request notification / add to interested
      updateMission(missionId, { interested: [...(mission.interested || []), user.id] })
    } else {
      joinMission(missionId)
    }
  }

  const handleLeave = () => {
    if (!user) return
    leaveMission(missionId)
  }

  const handleAddRule = () => {
    if (!newRule.trim() || !isLeader) return
    updateMission(missionId, { rules: [...(mission.rules || []), newRule.trim()] })
    setNewRule('')
  }

  const handleRemoveRule = (idx) => {
    if (!isLeader) return
    const rules = [...(mission.rules || [])]
    rules.splice(idx, 1)
    updateMission(missionId, { rules })
  }

  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return
    const item = { id: genId(), text: newCheckItem.trim(), done: false, addedBy: user.id }
    updateMission(missionId, { checklist: [...(mission.checklist || []), item] })
    setNewCheckItem('')
  }

  const handleToggleCheck = (itemId) => {
    const checklist = (mission.checklist || []).map(i => i.id === itemId ? { ...i, done: !i.done } : i)
    updateMission(missionId, { checklist })
  }

  const handleRemoveCheck = (itemId) => {
    const checklist = (mission.checklist || []).filter(i => i.id !== itemId)
    updateMission(missionId, { checklist })
  }

  const handleAddSchedule = () => {
    if (!newScheduleItem.day || !newScheduleItem.activity) return
    const item = { id: genId(), ...newScheduleItem }
    updateMission(missionId, { schedule: [...(mission.schedule || []), item] })
    setNewScheduleItem({ day: '', time: '', activity: '' })
  }

  const handleRemoveSchedule = (itemId) => {
    const schedule = (mission.schedule || []).filter(i => i.id !== itemId)
    updateMission(missionId, { schedule })
  }

  const handleAddResource = () => {
    if (!newResource.title || !newResource.url) return
    const item = { id: genId(), ...newResource }
    updateMission(missionId, { resources: [...(mission.resources || []), item] })
    setNewResource({ title: '', url: '' })
  }

  const handleRemoveResource = (itemId) => {
    const resources = (mission.resources || []).filter(i => i.id !== itemId)
    updateMission(missionId, { resources })
  }

  const handleBannerUpdate = () => {
    const url = prompt('Enter banner image URL:', mission.banner || '')
    if (url !== null) updateMission(missionId, { banner: url })
  }

  if (!mission) return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, textAlign: 'center' }}>
        <Mountain size={48} style={{ opacity: 0.2, marginBottom: 16, color: 'var(--text-muted)' }} />
        <h2>Mission not found</h2>
        <Link to="/missions" className="btn-primary btn-small" style={{ marginTop: 20 }}><ArrowLeft size={16} /> Back to Missions</Link>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 0, paddingBottom: 80, maxWidth: 960 }}>
        {/* Back link */}
        <Link to="/missions" className="nav-link" style={{ marginBottom: 0, padding: '16px 0 0', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeft size={16} /> All Missions
        </Link>

        {/* BANNER HERO */}
        <div style={{
          marginTop: 16, borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative',
          minHeight: 240, background: mission.banner ? `url(${mission.banner}) center/cover` : 'linear-gradient(135deg, var(--accent-gold-glow), var(--accent-teal-glow))',
          display: 'flex', alignItems: 'flex-end'
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
          }} />
          {isLeader && (
            <button onClick={handleBannerUpdate} style={{
              position: 'absolute', top: 16, right: 16, zIndex: 2,
              padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600,
              background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(8px)'
            }}>
              <ImageIcon size={14} /> Set Banner
            </button>
          )}
          <div style={{ position: 'relative', zIndex: 1, padding: 32, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                {mission.type}
              </span>
              {mission.joinType === 'approval' && (
                <span className="badge" style={{ background: 'rgba(249,115,22,0.3)', color: '#fbbf24', backdropFilter: 'blur(8px)' }}>
                  <Lock size={11} /> Approval Required
                </span>
              )}
              {mission.joinType === 'invite' && (
                <span className="badge" style={{ background: 'rgba(239,68,68,0.3)', color: '#fca5a5', backdropFilter: 'blur(8px)' }}>
                  <Lock size={11} /> Invite Only
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: 6 }}>{mission.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>Led by <strong style={{ color: '#fff' }}>{mission.leader}</strong></p>
          </div>
        </div>

        {/* INFO BAR */}
        <div className="glass-card" style={{
          padding: '16px 24px', marginTop: -1, borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <Calendar size={14} /> {mission.startDate} → {mission.endDate}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <Globe size={14} /> {mission.countries?.join(', ')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <Users size={14} /> {mission.participants.length} / {mission.maxParticipants} joined
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {isLeader ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setJoinTypeMenu(!joinTypeMenu)} className="btn-secondary btn-small" style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {mission.joinType === 'open' ? <Unlock size={13} /> : mission.joinType === 'approval' ? <Lock size={13} /> : <Lock size={13} />}
                  {mission.joinType === 'open' ? 'Open' : mission.joinType === 'approval' ? 'Approval' : 'Invite Only'}
                </button>
                {joinTypeMenu && (
                  <div className="glass-card" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, padding: 4, zIndex: 20, minWidth: 180 }}>
                    {[['open', 'Open to Everyone', <Unlock size={14} />], ['approval', 'Leader Approval', <Lock size={14} />], ['invite', 'Invite Only', <Lock size={14} />]].map(([val, label, icon]) => (
                      <button key={val} onClick={() => { updateMission(missionId, { joinType: val }); setJoinTypeMenu(false) }} style={{
                        width: '100%', padding: '8px 12px', fontSize: '0.82rem', textAlign: 'left',
                        background: mission.joinType === val ? 'var(--accent-gold-glow)' : 'transparent',
                        color: mission.joinType === val ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 8
                      }}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : user && (
              canJoin ? (
                <button onClick={handleJoin} className="btn-primary btn-small" style={{ padding: '6px 20px', fontSize: '0.85rem' }}>
                  {mission.joinType === 'approval' ? 'Request to Join' : 'Join Mission'} <Plus size={15} />
                </button>
              ) : hasJoined ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="badge badge-teal" style={{ fontSize: '0.78rem' }}><Check size={13} /> Joined</span>
                  <button onClick={handleLeave} className="btn-secondary btn-small" style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--accent-rose, #ef4444)', borderColor: 'var(--accent-rose, #ef4444)' }}>
                    Leave
                  </button>
                </div>
              ) : (
                <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  {isFull ? 'Mission Full' : isPastDeadline ? 'Deadline Passed' : 'Invite Only'}
                </span>
              )
            )}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 4, marginTop: 24, borderBottom: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: <Shield size={16} /> },
            { id: 'chat', label: 'Chat', icon: <MessageSquare size={16} />, count: messages.length },
            { id: 'plan', label: 'Plan', icon: <ListTodo size={16} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '12px 20px', fontSize: '0.9rem', fontWeight: 600,
              color: activeTab === tab.id ? 'var(--accent-gold)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-gold)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit'
            }}>
              {tab.icon} {tab.label} {tab.count !== undefined && <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
            {/* Description */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>About This Mission</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' }}>{mission.description}</p>
            </div>

            {/* Rules */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Flag size={16} /> Mission Rules
                </h3>
              </div>
              {(mission.rules || []).length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(mission.rules || []).map((rule, i) => (
                    <li key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-gold)', flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ flex: 1, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{rule}</span>
                      {isLeader && (
                        <button onClick={() => handleRemoveRule(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-danger, #ef4444)', padding: 2, flexShrink: 0 }}>
                          <X size={14} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No rules set for this mission.</p>
              )}
              {isLeader && (
                <form onSubmit={e => { e.preventDefault(); handleAddRule() }} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input className="form-input" placeholder="Add a rule..." value={newRule} onChange={e => setNewRule(e.target.value)} style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }} />
                  <button type="submit" className="btn-primary btn-small" disabled={!newRule.trim()} style={{ padding: '8px 14px', opacity: newRule.trim() ? 1 : 0.4 }}><Plus size={15} /></button>
                </form>
              )}
            </div>

            {/* Members */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} /> Members ({participantProfiles.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {participantProfiles.map(p => (
                  <Link key={p.id} to={`/explorer/${p.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                    borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)', textDecoration: 'none', color: 'inherit'
                  }}>
                    <Avatar name={p.name} url={p.avatar} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                        {p.name}
                        {p.isYou && <span style={{ color: 'var(--accent-teal)', fontSize: '0.75rem', marginLeft: 6 }}>(You)</span>}
                      </div>
                      {p.home && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.home}</div>}
                    </div>
                    {p.id === mission.leaderId && <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Leader</span>}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== CHAT TAB ===== */}
        {activeTab === 'chat' && (
          <div style={{ display: 'flex', gap: 0, marginTop: 20, minHeight: 'calc(100vh - 500px)', maxHeight: 'calc(100vh - 200px)' }}>
            {/* Messages */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              background: 'var(--bg-card)', borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)',
              border: '1px solid var(--border-subtle)', borderRight: 'none', overflow: 'hidden'
            }}>
              {/* Chat header */}
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg-secondary)'
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{mission.title} Chat</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{participantProfiles.length} members</div>
              </div>

              {/* Message list */}
              <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.length > INITIAL_MSGS && visibleMessages.length < messages.length && (
                  <button onClick={() => setMsgLimit(m => m + 20)} style={{
                    padding: '8px', fontSize: '0.78rem', color: 'var(--accent-teal)', fontWeight: 600,
                    border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8
                  }}>
                    <ChevronDown size={14} /> Load older messages
                  </button>
                )}
                {messageGroups.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messageGroups.map((group, gi) => (
                    <div key={gi}>
                      <div style={{ textAlign: 'center', margin: '16px 0 8px' }}>
                        <span style={{
                          fontSize: '0.7rem', color: 'var(--text-muted)', padding: '2px 12px',
                          background: 'var(--bg-elevated)', borderRadius: 100
                        }}>
                          {group.date}
                        </span>
                      </div>
                      {group.items.map((msg, mi) => {
                        const isOwn = msg.fromId === user.id
                        const isEditing = editingMsg === msg.id
                        return (
                          <div key={msg.id || mi} style={{
                            display: 'flex', gap: 10, marginBottom: 6,
                            flexDirection: isOwn ? 'row-reverse' : 'row',
                            alignItems: 'flex-start'
                          }}>
                            {!isOwn && <Avatar name={msg.from} size={28} />}
                            <div style={{ maxWidth: '75%', minWidth: 0 }}>
                              {!isOwn && (
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-teal)', marginBottom: 2, marginLeft: 4 }}>
                                  {msg.from}
                                </div>
                              )}
                              <div style={{
                                padding: '8px 14px', borderRadius: 16,
                                background: isOwn ? 'var(--accent-gold-glow)' : 'var(--bg-elevated)',
                                border: '1px solid', borderColor: isOwn ? 'var(--accent-gold)' : 'var(--border-subtle)',
                                borderBottomRightRadius: isOwn ? 4 : 16,
                                borderBottomLeftRadius: isOwn ? 16 : 4,
                              }}>
                                {isEditing ? (
                                  <div>
                                    <input className="form-input" defaultValue={msg.text} autoFocus
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') handleEditMsg(msg.id, e.target.value)
                                        if (e.key === 'Escape') setEditingMsg(null)
                                      }}
                                      style={{ padding: '4px 8px', fontSize: '0.85rem', width: '100%' }}
                                    />
                                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                      <button onClick={() => { const inp = document.activeElement; handleEditMsg(msg.id, inp?.value || msg.text) }} className="btn-primary btn-small" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Save</button>
                                      <button onClick={() => setEditingMsg(null)} className="btn-secondary btn-small" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                                        {formatTime(msg.timestamp)}
                                        {msg.edited && <span style={{ marginLeft: 4, fontStyle: 'italic' }}>edited</span>}
                                      </div>
                                      <div style={{ display: 'flex', gap: 2 }}>
                                        {isOwn && (
                                          <>
                                            <button onClick={() => setEditingMsg(msg.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                                              <Edit3 size={11} />
                                            </button>
                                            <button onClick={() => handleDeleteMsg(msg.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-danger, #ef4444)', padding: 2 }}>
                                              <Trash2 size={11} />
                                            </button>
                                          </>
                                        )}
                                        <button onClick={() => setReactionPicker(reactionPicker === msg.id ? null : msg.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                                          <ThumbsUp size={11} />
                                        </button>
                                      </div>
                                    </div>
                                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                      <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                                          <span key={emoji} style={{
                                            fontSize: '0.7rem', padding: '1px 6px', borderRadius: 100,
                                            background: users.includes(user.id) ? 'var(--accent-gold-glow)' : 'var(--bg-secondary)',
                                            border: '1px solid var(--border-subtle)', cursor: 'pointer'
                                          }} onClick={() => handleReact(msg.id, emoji)}>
                                            {emoji} {users.length}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    {reactionPicker === msg.id && (
                                      <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                                        {['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '✅'].map(e => (
                                          <span key={e} style={{ cursor: 'pointer', fontSize: '1rem', padding: 2 }} onClick={() => handleReact(msg.id, e)}>{e}</span>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSend} style={{
                padding: '12px 16px', borderTop: '1px solid var(--border-subtle)',
                display: 'flex', gap: 10, background: 'var(--bg-secondary)'
              }}>
                <input className="form-input" placeholder="Type a message..." value={msgText} onChange={e => setMsgText(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }} />
                <button type="submit" className="btn-primary" disabled={!msgText.trim() || !user}
                  style={{ padding: '10px 18px', opacity: msgText.trim() && user ? 1 : 0.4 }}>
                  <Send size={18} />
                </button>
              </form>
            </div>

            {/* Members sidebar */}
            <div style={{
              width: 220, flexShrink: 0,
              background: 'var(--bg-secondary)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
              border: '1px solid var(--border-subtle)', padding: 16,
              display: 'flex', flexDirection: 'column', gap: 8
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>Members</div>
              {participantProfiles.map(p => (
                <Link key={p.id} to={`/explorer/${p.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'inherit',
                  background: 'transparent', transition: 'background 0.15s', fontSize: '0.82rem'
                }}>
                  <div style={{ position: 'relative' }}>
                    <Avatar name={p.name} url={p.avatar} size={28} />
                    <div style={{
                      position: 'absolute', bottom: -1, right: -1, width: 8, height: 8,
                      borderRadius: '50%', background: '#22c55e',
                      border: '2px solid var(--bg-secondary)'
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                    {p.isYou && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}> (you)</span>}
                  </div>
                  {p.id === mission.leaderId && <Shield size={11} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ===== PLAN TAB ===== */}
        {activeTab === 'plan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
            {/* Checklist */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ListTodo size={16} /> Checklist
              </h3>
              {(mission.checklist || []).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {(mission.checklist || []).map(item => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
                      background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <button onClick={() => handleToggleCheck(item.id)} style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
                        border: '2px solid', borderColor: item.done ? 'var(--accent-teal)' : 'var(--border-medium)',
                        background: item.done ? 'var(--accent-teal)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {item.done && <Check size={12} color="#fff" />}
                      </button>
                      <span style={{
                        flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)',
                        textDecoration: item.done ? 'line-through' : 'none',
                        opacity: item.done ? 0.5 : 1
                      }}>{item.text}</span>
                      <button onClick={() => handleRemoveCheck(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={e => { e.preventDefault(); handleAddCheckItem() }} style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" placeholder="Add to-do item..." value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)} style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }} />
                <button type="submit" className="btn-primary btn-small" disabled={!newCheckItem.trim()} style={{ padding: '8px 14px', opacity: newCheckItem.trim() ? 1 : 0.4 }}><Plus size={15} /></button>
              </form>
            </div>

            {/* Schedule */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} /> Schedule / Itinerary
              </h3>
              {(mission.schedule || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {(mission.schedule || []).map(item => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                      background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 50 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{item.day}</div>
                        {item.time && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.time}</div>}
                      </div>
                      <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.activity}</div>
                      <button onClick={() => handleRemoveSchedule(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>No schedule yet.</p>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input className="form-input" placeholder="Day (e.g. Day 1)" value={newScheduleItem.day} onChange={e => setNewScheduleItem(p => ({ ...p, day: e.target.value }))} style={{ flex: '0 0 100px', padding: '8px 10px', fontSize: '0.82rem' }} />
                <input className="form-input" placeholder="Time" value={newScheduleItem.time} onChange={e => setNewScheduleItem(p => ({ ...p, time: e.target.value }))} style={{ flex: '0 0 80px', padding: '8px 10px', fontSize: '0.82rem' }} />
                <input className="form-input" placeholder="Activity..." value={newScheduleItem.activity} onChange={e => setNewScheduleItem(p => ({ ...p, activity: e.target.value }))} style={{ flex: 1, minWidth: 150, padding: '8px 10px', fontSize: '0.82rem' }} />
                <button onClick={handleAddSchedule} className="btn-primary btn-small" disabled={!newScheduleItem.day || !newScheduleItem.activity} style={{ padding: '8px 14px', opacity: newScheduleItem.day && newScheduleItem.activity ? 1 : 0.4 }}><Plus size={15} /></button>
              </div>
            </div>

            {/* Resources */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <LinkIcon size={16} /> Shared Resources
              </h3>
              {(mission.resources || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {(mission.resources || []).map(item => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                      background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <ExternalLink size={14} style={{ flexShrink: 0, color: 'var(--accent-teal)' }} />
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
                        flex: 1, fontSize: '0.85rem', color: 'var(--accent-teal)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>{item.title}</a>
                      <button onClick={() => handleRemoveResource(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>No resources shared yet.</p>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input className="form-input" placeholder="Title" value={newResource.title} onChange={e => setNewResource(p => ({ ...p, title: e.target.value }))} style={{ flex: '0 0 140px', padding: '8px 10px', fontSize: '0.82rem' }} />
                <input className="form-input" placeholder="URL" value={newResource.url} onChange={e => setNewResource(p => ({ ...p, url: e.target.value }))} style={{ flex: 1, minWidth: 150, padding: '8px 10px', fontSize: '0.82rem' }} />
                <button onClick={handleAddResource} className="btn-primary btn-small" disabled={!newResource.title || !newResource.url} style={{ padding: '8px 14px', opacity: newResource.title && newResource.url ? 1 : 0.4, flexShrink: 0 }}><Plus size={15} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}