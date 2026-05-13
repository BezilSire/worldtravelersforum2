import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { MapPin, Calendar, Users, Star, Shield, ArrowRight, X, CheckCircle2, ClipboardList, Zap, Trophy, MessageSquare } from 'lucide-react'

export default function TestMissions() {
  const { user } = useAuth()
  const { testMissions, testMissionApplications, applyToTestMission, updateTestMissionApplicationStatus } = useData()
  const [selectedMission, setSelectedMission] = useState(null)
  const [showApply, setShowApply] = useState(false)
  const [motivation, setMotivation] = useState('')
  const [applied, setApplied] = useState(false)

  const handleApply = (e) => {
    e.preventDefault()
    if (!user || !selectedMission) return
    applyToTestMission({
      missionId: selectedMission.id,
      missionTitle: selectedMission.title,
      userId: user.id,
      userName: user.full_name,
      userAvatar: user.avatar_url || user.full_name?.charAt(0).toUpperCase(),
      motivation,
      participationScore: user.xp ? Math.min(100, Math.floor(user.xp / 10)) : 85,
      verifiedStays: user.stays_count || 0
    })
    setApplied(true)
    setTimeout(() => {
      setShowApply(false)
      setApplied(false)
      setSelectedMission(null)
      setMotivation('')
    }, 2000)
  }

  const isAdmin = user?.role === 'admin' || user?.id === 'usr_001' // Assuming lead user is admin for demo
  const userApplications = testMissionApplications.filter(app => app.userId === user?.id)

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Header Section */}
        <div className="animate-fade-up" style={{ marginBottom: 48, maxWidth: 800 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span className="badge badge-gold" style={{ padding: '6px 12px', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              <Zap size={14} /> FIELD PROGRAMME
            </span>
          </div>
          <h1 style={{ fontSize: '2.8rem', marginBottom: 16, lineHeight: 1.1 }}>Traveler <span className="text-gradient">Test Missions</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Coordinated field missions for trusted explorers. Test new hotels, document local experiences, and help build the future of <a href="https://cheaply.world" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-teal)', textDecoration: 'none', fontWeight: 600 }}>cheaply.world</a>. This is real-world exploration, not influencer marketing.
          </p>
        </div>

        {/* Explanation Section */}
        <div className="grid-3 animate-fade-up animate-delay-1" style={{ marginBottom: 60 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ color: 'var(--accent-gold)', marginBottom: 16 }}><Shield size={24} /></div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Trusted Selection</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Missions are only open to verified explorers with established reputations. We look for detail-oriented travelers who can provide honest, high-quality field reports.</p>
          </div>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ color: 'var(--accent-teal)', marginBottom: 16 }}><ClipboardList size={24} /></div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Field Documentation</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Participants document hotel stays, local logistics, and unique experiences. This data helps the network coordinate better trips for the entire community.</p>
          </div>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ color: 'var(--accent-gold)', marginBottom: 16 }}><Trophy size={24} /></div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Network Support</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>The Explorer Fund subsidizes mission costs. In exchange, your reports become valuable assets for the forum, helping others move more effectively.</p>
          </div>
        </div>

        {/* Dashboard for Approved Participants */}
        {userApplications.some(app => app.status === 'approved') && (
          <div className="glass-card animate-fade-up" style={{ marginBottom: 48, border: '1px solid var(--accent-teal-glow)', background: 'rgba(20, 184, 166, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={24} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', marginBottom: 2 }}>Active Field Assignment</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>You have been selected for a mission. Access your coordination tools below.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-primary btn-small"><ClipboardList size={14} /> Submit Field Report</button>
              <button className="btn-secondary btn-small"><MessageSquare size={14} /> Mission Group Chat</button>
            </div>
          </div>
        )}

        {/* Missions Grid */}
        <div className="grid-2">
          {testMissions.map((mission, i) => {
            const hasApplied = userApplications.some(app => app.missionId === mission.id)
            const application = userApplications.find(app => app.missionId === mission.id)
            
            return (
              <div key={mission.id} className={`glass-card animate-fade-up animate-delay-${i + 1}`} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 200, background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url('https://source.unsplash.com/featured/?${mission.image},travel')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: 20, left: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', fontSize: '0.85rem', marginBottom: 4 }}>
                      <MapPin size={14} /> {mission.city}, {mission.destination}
                    </div>
                    <h3 style={{ color: 'white', fontSize: '1.4rem' }}>{mission.title}</h3>
                  </div>
                  <div style={{ position: 'absolute', top: 20, right: 24 }}>
                    <span className="badge" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                      {mission.duration}
                    </span>
                  </div>
                </div>

                <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>{mission.description}</p>
                  
                  <div style={{ marginBottom: 24 }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Network Support</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {mission.support.map((item, idx) => (
                        <span key={idx} style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--bg-elevated)', borderRadius: 20, border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Requirements</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {mission.requirements.map((req, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <Shield size={12} color="var(--accent-teal)" /> {req}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {hasApplied ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`badge ${application.status === 'approved' ? 'badge-teal' : application.status === 'rejected' ? 'badge-rose' : 'badge-gold'}`}>
                          {application.status.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Applied on {new Date(application.timestamp).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setSelectedMission(mission); setShowApply(true); }} 
                        className="btn-primary" 
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        Apply for Mission <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Admin Section */}
        {isAdmin && testMissionApplications.length > 0 && (
          <div className="animate-fade-up" style={{ marginTop: 80 }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <ClipboardList size={24} color="var(--accent-gold)" /> Application Management
            </h2>
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>EXPLORER</th>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>MISSION</th>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>SCORE</th>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>STAYS</th>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>STATUS</th>
                    <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {testMissionApplications.map((app) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden' }}>
                            {app.userAvatar?.length === 1 ? app.userAvatar : <img src={app.userAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{app.userName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>{app.missionTitle}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>{app.participationScore}</span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>{app.verifiedStays}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span className={`badge ${app.status === 'approved' ? 'badge-teal' : app.status === 'rejected' ? 'badge-rose' : 'badge-gold'}`} style={{ fontSize: '0.7rem' }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        {app.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={() => updateTestMissionApplicationStatus(app.id, 'approved')} className="btn-secondary btn-small" style={{ color: 'var(--accent-teal)' }}>Approve</button>
                            <button onClick={() => updateTestMissionApplicationStatus(app.id, 'rejected')} className="btn-secondary btn-small" style={{ color: 'var(--accent-rose)' }}>Decline</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApply && selectedMission && (
        <div className="modal-overlay" onClick={() => setShowApply(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            {applied ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-teal-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle2 size={32} color="var(--accent-teal)" />
                </div>
                <h2 style={{ marginBottom: 12 }}>Application Submitted</h2>
                <p style={{ color: 'var(--text-secondary)' }}>The network coordination team will review your profile and motivation. You will be notified if selected.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 className="modal-title" style={{ marginBottom: 0 }}>Mission Application</h2>
                  <button onClick={() => setShowApply(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
                </div>
                
                <div style={{ marginBottom: 24, padding: 16, background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>APPLYING FOR</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedMission.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{selectedMission.city}, {selectedMission.destination}</div>
                </div>

                <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Motivation & Field Strategy</label>
                    <textarea 
                      className="form-input" 
                      placeholder="Why are you the right explorer for this mission? How will you document your findings?" 
                      style={{ minHeight: 120 }}
                      value={motivation}
                      onChange={e => setMotivation(e.target.value)}
                      required
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                      Your explorer score ({user?.xp ? Math.min(100, Math.floor(user.xp / 10)) : 85}) and verified stays ({user?.stays_count || 0}) will be automatically included in your application.
                    </p>
                  </div>
                  
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Submit Field Application <ArrowRight size={16} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
