import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { Shield, Plus, X, CheckCircle2, XCircle, Landmark, Send, Globe, Trash2, Users, Mountain, Calendar, ArrowRight, Bell, Search, BarChart3, MapPin, Trophy } from 'lucide-react'
import { calcReputation } from '../lib/reputation.js'

export default function Admin() {
  const { user } = useAuth()
  const { isAdmin, testMissions, testMissionApplications, updateTestMissionApplicationStatus, addTestMission, removeTestMission, fund, updateFundData, postSystemBroadcast } = useData()

  const [activeTab, setActiveTab] = useState('missions')
  const [showAddMission, setShowAddMission] = useState(false)
  const [newMission, setNewMission] = useState({ title: '', type: '', destination: '', city: '', description: '', duration: '', support: '', requirements: '' })

  const [fundForm, setFundForm] = useState({
    totalRevenue: fund.totalRevenue || 0,
    fundAllocation: fund.fundAllocation || 0,
    percentAllocated: fund.percentAllocated || 15,
    breakdown: fund.breakdown.map(b => ({ ...b })),
    recentAllocations: fund.recentAllocations.map(r => ({ ...r }))
  })

  const [broadcast, setBroadcast] = useState({ title: '', body: '' })

  const [profiles, setProfiles] = useState([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('joined_date', { ascending: false })
      if (!error && data) {
        setProfiles(data)
      }
      setLoadingProfiles(false)
    }
    fetchProfiles()
  }, [isAdmin])

  // Profile metrics aggregations
  const countryCounts = profiles.reduce((acc, p) => {
    const country = p.home_country?.trim() || 'Undecided / Not Set'
    acc[country] = (acc[country] || 0) + 1
    return acc
  }, {})

  const sortedCountries = Object.entries(countryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const totalExplorers = profiles.length
  const countriesCount = sortedCountries.filter(c => c.name !== 'Undecided / Not Set').length
  const totalStays = profiles.reduce((acc, p) => acc + (p.stays_count || 0), 0)
  const avgStays = totalExplorers > 0 ? (totalStays / totalExplorers).toFixed(1) : 0

  const filteredProfiles = profiles.filter(p => {
    const query = searchQuery.toLowerCase()
    return (
      p.full_name?.toLowerCase().includes(query) ||
      p.username?.toLowerCase().includes(query) ||
      p.home_country?.toLowerCase().includes(query)
    )
  })

  if (!isAdmin) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Access restricted.</p>
    </div>
  )

  const handleAddMission = (e) => {
    e.preventDefault()
    addTestMission({
      title: newMission.title,
      type: newMission.type || 'Field Test',
      destination: newMission.destination,
      city: newMission.city,
      description: newMission.description,
      duration: newMission.duration || 'TBD',
      support: newMission.support.split(',').map(s => s.trim()).filter(Boolean),
      requirements: newMission.requirements.split(',').map(r => r.trim()).filter(Boolean),
      image: newMission.destination?.toLowerCase().replace(/\s+/g, '-') || 'custom'
    })
    setNewMission({ title: '', type: '', destination: '', city: '', description: '', duration: '', support: '', requirements: '' })
    setShowAddMission(false)
  }

  const handleFundSave = (e) => {
    e.preventDefault()
    updateFundData(fundForm)
  }

  const updateBreakdown = (i, field, value) => {
    setFundForm(prev => {
      const b = [...prev.breakdown]
      b[i] = { ...b[i], [field]: field === 'amount' ? parseInt(value) || 0 : value }
      return { ...prev, breakdown: b }
    })
  }

  const handleBroadcast = (e) => {
    e.preventDefault()
    if (!broadcast.title.trim() || !broadcast.body.trim()) return
    postSystemBroadcast(broadcast)
    setBroadcast({ title: '', body: '' })
  }

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>
            <Shield size={28} style={{ color: 'var(--accent-gold)', marginRight: 12 }} />
            Network <span className="text-gradient">Admin</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage test missions, fund allocations, and send network broadcasts.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 40, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0, flexWrap: 'wrap' }}>
          {[
            { id: 'missions', label: 'Test Missions', icon: <Mountain size={16} /> },
            { id: 'metrics', label: 'Explorer Metrics', icon: <Users size={16} /> },
            { id: 'fund', label: 'Fund', icon: <Landmark size={16} /> },
            { id: 'broadcast', label: 'Broadcast', icon: <Send size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px', background: 'none', border: 'none',
                color: activeTab === tab.id ? 'var(--accent-gold)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-gold)' : '2px solid transparent',
                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: -1
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Test Missions Tab */}
        {activeTab === 'missions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mountain size={20} style={{ color: 'var(--accent-gold)' }} /> Test Mission Offers
              </h2>
              <button onClick={() => setShowAddMission(true)} className="btn-primary btn-small">
                <Plus size={16} /> New Offer
              </button>
            </div>

            {/* Existing Missions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
              {testMissions.map(m => (
                <div key={m.id} className="glass-card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 4 }}>{m.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{m.destination} · {m.duration}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.description}</div>
                  </div>
                  <button onClick={() => removeTestMission(m.id)} style={{ color: 'var(--accent-rose)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Applications */}
            <h2 style={{ fontSize: '1.3rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={20} style={{ color: 'var(--accent-teal)' }} /> Applications ({testMissionApplications.length})
            </h2>
            {testMissionApplications.length === 0 ? (
              <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No applications received yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {testMissionApplications.map(app => (
                  <div key={app.id} className="glass-card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden' }}>
                          {app.userAvatar?.length === 1 ? app.userAvatar : <img src={app.userAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <span style={{ fontWeight: 600 }}>{app.userName}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: 42 }}>{app.missionTitle}</div>
                      {app.motivation && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, marginLeft: 42, fontStyle: 'italic' }}>"{app.motivation.substring(0, 120)}"</div>}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, marginLeft: 42 }}>Score: {app.participationScore} · Stays: {app.verifiedStays}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className={`badge ${app.status === 'approved' ? 'badge-teal' : app.status === 'rejected' ? 'badge-rose' : 'badge-gold'}`}>
                        {app.status}
                      </span>
                      {app.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => updateTestMissionApplicationStatus(app.id, 'approved')} className="btn-secondary btn-small" style={{ color: 'var(--accent-teal)' }}>
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button onClick={() => updateTestMissionApplicationStatus(app.id, 'rejected')} className="btn-secondary btn-small" style={{ color: 'var(--accent-rose)' }}>
                            <XCircle size={14} /> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fund Tab */}
        {activeTab === 'fund' && (
          <div>
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Landmark size={20} style={{ color: 'var(--accent-gold)' }} /> Fund Configuration
              </h2>
              <form onSubmit={handleFundSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Total Revenue ($)</label>
                    <input className="form-input" type="number" value={fundForm.totalRevenue} onChange={e => setFundForm({...fundForm, totalRevenue: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fund Allocation ($)</label>
                    <input className="form-input" type="number" value={fundForm.fundAllocation} onChange={e => setFundForm({...fundForm, fundAllocation: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Allocation %</label>
                  <input className="form-input" type="number" min="0" max="100" value={fundForm.percentAllocated} onChange={e => setFundForm({...fundForm, percentAllocated: parseInt(e.target.value) || 0})} />
                </div>

                <h3 style={{ fontSize: '1rem', marginTop: 12, color: 'var(--text-secondary)' }}>Breakdown Categories</h3>
                {fundForm.breakdown.map((item, i) => (
                  <div key={i} className="glass-card" style={{ padding: 16, background: 'var(--bg-elevated)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 12 }}>{item.category}</div>
                    <div className="grid-2" style={{ gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Amount ($)</label>
                        <input className="form-input" type="number" value={item.amount} onChange={e => updateBreakdown(i, 'amount', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Percent (%)</label>
                        <input className="form-input" type="number" min="0" max="100" value={item.percent} onChange={e => updateBreakdown(i, 'percent', e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Description</label>
                      <input className="form-input" value={item.description} onChange={e => updateBreakdown(i, 'description', e.target.value)} />
                    </div>
                  </div>
                ))}

                <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                  <Landmark size={18} /> Save Fund Configuration
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Broadcast Tab */}
        {activeTab === 'broadcast' && (
          <div>
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Send size={20} style={{ color: 'var(--accent-teal)' }} /> Network Broadcast
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
                Send a system-wide message that will appear in the feed and as a notification to all users.
              </p>
              <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Announcement Title</label>
                  <input className="form-input" placeholder="e.g. New Mission Alert" value={broadcast.title} onChange={e => setBroadcast({...broadcast, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Message Body</label>
                  <textarea className="form-input" placeholder="Write your broadcast message to the network..." style={{ minHeight: 120 }} value={broadcast.body} onChange={e => setBroadcast({...broadcast, body: e.target.value})} required />
                </div>
                <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                  <Send size={18} /> Send Broadcast
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Explorer Metrics Tab */}
        {activeTab === 'metrics' && (
          <div>
            {loadingProfiles ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <p>Loading network metrics...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                
                {/* Stats Cards Row */}
                <div className="grid-4">
                  <div className="stat-card" style={{ padding: 24 }}>
                    <div style={{ color: 'var(--accent-gold)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={20} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Explorers</span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{totalExplorers}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Registered network members</div>
                  </div>

                  <div className="stat-card" style={{ padding: 24 }}>
                    <div style={{ color: 'var(--accent-teal)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Globe size={20} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Countries Represented</span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent-teal)' }}>{countriesCount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Unique home countries specified</div>
                  </div>

                  <div className="stat-card" style={{ padding: 24 }}>
                    <div style={{ color: 'var(--accent-blue)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={20} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Network Stays</span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{totalStays}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Total verified explorer stays</div>
                  </div>

                  <div className="stat-card" style={{ padding: 24 }}>
                    <div style={{ color: 'var(--accent-purple)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BarChart3 size={20} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Average Stays / User</span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{avgStays}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Verification density ratio</div>
                  </div>
                </div>

                {/* Country Breakdown & Level Distribution Column */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
                  {/* Left: Where they are from (Home Country Breakdown) */}
                  <div className="glass-card" style={{ padding: 32 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MapPin size={18} style={{ color: 'var(--accent-gold)' }} /> Demographics (Home Countries)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {sortedCountries.map((c, idx) => {
                        const pct = totalExplorers > 0 ? ((c.count / totalExplorers) * 100).toFixed(1) : 0
                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                              <span style={{ fontWeight: 600, color: c.name === 'Undecided / Not Set' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                {c.name}
                              </span>
                              <span style={{ color: 'var(--text-secondary)' }}>
                                {c.count} {c.count === 1 ? 'explorer' : 'explorers'} ({pct}%)
                              </span>
                            </div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ 
                                height: '100%', 
                                background: c.name === 'Undecided / Not Set' ? 'var(--border-subtle)' : 'var(--accent-gold)',
                                width: `${pct}%`,
                                borderRadius: 3
                              }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                </div>

                {/* Directory Table */}
                <div className="glass-card" style={{ padding: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                      <Users size={18} style={{ color: 'var(--accent-gold)' }} /> Explorer Directory
                    </h3>
                    <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
                      <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                      <input 
                        className="form-input" 
                        style={{ paddingLeft: 36, fontSize: '0.85rem' }} 
                        placeholder="Search by name, username, base..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <th style={{ padding: '12px 16px' }}>Explorer</th>
                          <th style={{ padding: '12px 16px' }}>Home Base</th>
                          <th style={{ padding: '12px 16px' }}>Joined Date</th>
                          <th style={{ padding: '12px 16px' }}>Rank / Level</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Stays</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Countries</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Vouches</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProfiles.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                              No explorers match your search.
                            </td>
                          </tr>
                        ) : (
                          filteredProfiles.map((p, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <div style={{ 
                                    width: 36, height: 36, borderRadius: 10, 
                                    background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', flexShrink: 0
                                  }}>
                                    {p.avatar_url?.startsWith('http') || p.avatar_url?.startsWith('data:') ? (
                                      <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      p.avatar_url || p.full_name?.charAt(0).toUpperCase() || 'U'
                                    )}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600 }}>{p.full_name || 'Anonymous Explorer'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>@{p.username || 'explorer'}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px', color: p.home_country ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                {p.home_country || 'Not Specified'}
                              </td>
                              <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                                {p.joined_date ? new Date(p.joined_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                              </td>
                              <td style={{ padding: '16px' }}>
                                <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                                  {calcReputation({
                                    countriesCount: p.countries_count || 0,
                                    staysCount: p.stays_count || 0,
                                    postsCount: 0,
                                    flightsCount: 0,
                                    tripReportsCount: 0,
                                    vouchesCount: p.vouches_count || 0,
                                    missionsCount: p.missions_count || 0
                                  }).rank}
                                </span>
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: 'var(--accent-blue)' }}>
                                {p.stays_count || 0}
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: 'var(--accent-gold)' }}>
                                {p.countries_count || 0}
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: 'var(--accent-rose)' }}>
                                {p.vouches_count || 0}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Mission Modal */}
      {showAddMission && (
        <div className="modal-overlay" onClick={() => setShowAddMission(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="modal-title" style={{ marginBottom: 0 }}>New Test Mission Offer</h2>
              <button onClick={() => setShowAddMission(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddMission} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" value={newMission.title} onChange={e => setNewMission({...newMission, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <input className="form-input" placeholder="e.g. Field Test" value={newMission.type} onChange={e => setNewMission({...newMission, type: e.target.value})} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <input className="form-input" placeholder="e.g. Thailand" value={newMission.destination} onChange={e => setNewMission({...newMission, destination: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" placeholder="e.g. Bangkok" value={newMission.city} onChange={e => setNewMission({...newMission, city: e.target.value})} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input className="form-input" placeholder="e.g. 2 Weeks" value={newMission.duration} onChange={e => setNewMission({...newMission, duration: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" style={{ minHeight: 80 }} value={newMission.description} onChange={e => setNewMission({...newMission, description: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Support Items (comma separated)</label>
                <input className="form-input" placeholder="Accommodation, Local SIM, Meals" value={newMission.support} onChange={e => setNewMission({...newMission, support: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Requirements (comma separated)</label>
                <input className="form-input" placeholder="5+ Stays, Photography skills" value={newMission.requirements} onChange={e => setNewMission({...newMission, requirements: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                <Plus size={18} /> Add Mission Offer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
