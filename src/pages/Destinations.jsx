import { useData } from '../context/DataContext.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Users, MessageSquare, ArrowRight, Globe, Shield, Plus, X, Search } from 'lucide-react'
import { useState } from 'react'

export default function Destinations() {
  const { destinations, startDiscussion } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [showStartModal, setShowStartModal] = useState(false)
  const [newCountry, setNewCountry] = useState('')
  const navigate = useNavigate()

  const filtered = destinations.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStart = (e) => {
    e.preventDefault()
    if (!newCountry.trim()) return
    const id = startDiscussion(newCountry)
    navigate(`/destinations/${id}`)
  }

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        
        <div className="animate-fade-up" style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', marginBottom: 12 }}>Coordination <span className="text-gradient">Hubs</span></h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 600 }}>Join destination-specific discussions, coordinate movements and share real-time insights with other explorers.</p>
          </div>
          <button onClick={() => setShowStartModal(true)} className="btn-primary" style={{ borderRadius: 100 }}>
            <Plus size={18} /> Start New Hub
          </button>
        </div>

        {/* Search */}
        <div className="animate-fade-up animate-delay-1" style={{ position: 'relative', marginBottom: 48 }}>
          <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
          <input 
            className="form-input" 
            placeholder="Search for a country hub..." 
            style={{ width: '100%', paddingLeft: 52, background: 'var(--bg-card)', fontSize: '1.1rem', height: 60 }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid-3">
          {filtered.map((dest, i) => (
            <div key={dest.id} className={`glass-card animate-fade-up animate-delay-${Math.min(i + 1, 4)}`} style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>{dest.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                    <Shield size={14} /> {dest.staysCount} Verified Stays
                  </div>
                </div>
                <div style={{ padding: '4px 10px', background: 'var(--accent-teal-glow)', color: 'var(--accent-teal)', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600 }}>
                  Active
                </div>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>{dest.description}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <Users size={16} /> {dest.explorers} Explorers
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <MessageSquare size={16} /> {dest.discussionsCount} Discussions
                </div>
              </div>
              
              <Link to={`/destinations/${dest.id}`} className="btn-secondary btn-small" style={{ width: '100%', justifyContent: 'center' }}>
                Join Discussion <ArrowRight size={14} />
              </Link>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <Globe size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
              <p>No hubs found for "{searchTerm}". Why not start one?</p>
              <button onClick={() => setShowStartModal(true)} className="btn-primary" style={{ marginTop: 20 }}>
                Start {searchTerm} Hub
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Start Discussion Modal */}
      {showStartModal && (
        <div className="modal-overlay" onClick={() => setShowStartModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="modal-title" style={{ marginBottom: 0 }}>Start Country Hub</h2>
              <button onClick={() => setShowStartModal(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 24 }}>
              Coordinate movement in a new destination. This will create a hub where you and other explorers can chat and plan missions.
            </p>

            <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Country Name</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Portugal, Vietnam, Brazil..." 
                  autoFocus
                  value={newCountry}
                  onChange={e => setNewCountry(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Open Hub
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
