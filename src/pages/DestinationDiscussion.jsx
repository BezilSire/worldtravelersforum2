import { useParams, Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ArrowLeft, Send, MessageSquare, Shield, User, Reply, X, Users, Check, Plus, Bookmark } from 'lucide-react'
import { useState } from 'react'

export default function DestinationDiscussion() {
  const { id } = useParams()
  const { user } = useAuth()
  const { destinations, discussions, postToDiscussion, followedDestinations, joinDestination, leaveDestination, destinationMembers, allProfiles } = useData()
  const [msgText, setMsgText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [showMembers, setShowMembers] = useState(false)

  const country = destinations.find(d => d.id === id)
  const posts = discussions[id] || []
  const isFollowing = followedDestinations?.includes(id)
  const members = destinationMembers?.[id] || []
  const memberProfiles = members.map(mid => allProfiles.find(p => p.id === mid)).filter(Boolean)

  const handleSend = (e) => {
    e.preventDefault()
    if (!msgText.trim() || !user) return
    postToDiscussion(id, {
      text: msgText,
      parentId: replyingTo?.id
    })
    setMsgText('')
    setReplyingTo(null)
  }

  if (!country) return <div className="page"><div className="container">Country not found.</div></div>

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 800 }}>
        <Link to="/destinations" className="nav-link" style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeft size={16} /> Back to Countries
        </Link>

        <div className="animate-fade-up" style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '2.2rem' }}>{country.name} <span className="text-gradient">Discussion</span></h1>
            {user && (
              <button
                onClick={() => isFollowing ? leaveDestination(id) : joinDestination(id)}
                className={`btn-${isFollowing ? 'secondary' : 'primary'} btn-small`}
                style={{ padding: '6px 14px', fontSize: '0.75rem' }}
              >
                {isFollowing ? <><Check size={14} /> Following</> : <><Plus size={14} /> Follow</>}
              </button>
            )}
            <button onClick={() => setShowMembers(!showMembers)} className="btn-secondary btn-small" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
              <Users size={14} /> {members.length > 0 ? members.length : '0'}
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{country.description}</p>
        </div>

        {showMembers && memberProfiles.length > 0 && (
          <div className="glass-card" style={{ marginBottom: 24, padding: 20 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Members following this destination</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {memberProfiles.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, overflow: 'hidden', flexShrink: 0 }}>
                    {p.avatar_url?.startsWith('http') ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.full_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{p.full_name}</span>
                  {p.id === user?.id && <span className="badge badge-teal" style={{ fontSize: '0.6rem' }}>You</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass-card" style={{ minHeight: 500, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', color: 'var(--accent-gold)' }}>
              <Shield size={16} /> {country.staysCount} Verified Explorers Active Here
            </div>
          </div>

          <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
            {posts.length > 0 ? (
              posts.map((post, i) => {
                const parent = post.parentId ? posts.find(p => p.id === post.parentId) : null
                
                return (
                  <div key={post.id} className="animate-fade-in" style={{ display: 'flex', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0, color: 'var(--accent-teal)' }}>
                      {post.user.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{post.user}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      {parent && (
                        <div style={{ padding: '8px 12px', borderLeft: '2px solid var(--accent-gold)', background: 'rgba(212,168,83,0.05)', marginBottom: 8, fontSize: '0.8rem', color: 'var(--text-muted)', borderRadius: '0 8px 8px 0' }}>
                          <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>@{parent.user}</span>: {parent.text.substring(0, 60)}{parent.text.length > 60 ? '...' : ''}
                        </div>
                      )}

                      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{post.text}</p>
                      
                      <button 
                        onClick={() => setReplyingTo(post)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Reply size={12} /> Reply
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--text-muted)' }}>
                <MessageSquare size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                <p>No discussions yet in {country.name}. Be the first to start the conversation!</p>
              </div>
            )}
          </div>

          {user && (
            <div style={{ padding: 24, borderTop: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
              {replyingTo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--accent-gold-glow)', borderRadius: '8px 8px 0 0', border: '1px solid var(--border-subtle)', borderBottom: 'none', fontSize: '0.8rem' }}>
                  <span>Replying to <strong style={{ color: 'var(--accent-gold)' }}>@{replyingTo.user}</strong></span>
                  <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              )}
              <form onSubmit={handleSend} style={{ display: 'flex', gap: 12 }}>
                <input 
                  className="form-input" 
                  placeholder={replyingTo ? `Write a reply...` : `Share a tip or coordinate in ${country.name}...`} 
                  style={{ flex: 1, borderRadius: replyingTo ? '0 0 4px 4px' : 'var(--radius-sm)' }}
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  autoFocus={!!replyingTo}
                />
                <button type="submit" className="btn-primary">
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
