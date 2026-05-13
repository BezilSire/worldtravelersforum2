import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'
import { Shield, Mountain, Star, Users, Globe, MapPin, MessageSquare, Heart, Send, Plus, TrendingUp, Award, Clock, Zap, Image, X, Tag } from 'lucide-react'
import { useState } from 'react'

const FEED_ICONS = {
  verified_stay: <Shield size={16} />,
  stay_submitted: <Shield size={16} />,
  mission_launch: <Mountain size={16} />,
  mission_join: <Users size={16} />,
  milestone: <Star size={16} />,
  user_post: <MessageSquare size={16} />,
  test_mission_report: <Zap size={16} />,
  mission_update: <Award size={16} />,
}
const FEED_COLORS = {
  verified_stay: 'var(--accent-teal)',
  stay_submitted: 'var(--accent-gold)',
  mission_launch: 'var(--accent-purple)',
  mission_join: 'var(--accent-blue)',
  milestone: 'var(--accent-gold)',
  user_post: 'var(--accent-teal)',
  test_mission_report: 'var(--accent-gold)',
  mission_update: 'var(--accent-teal)',
}

const FLAIRS = [
  { id: 'note', label: 'Note', color: 'var(--text-muted)' },
  { id: 'mission_update', label: 'Mission Update', color: 'var(--accent-purple)' },
  { id: 'travel_tip', label: 'Travel Tip', color: 'var(--accent-teal)' },
  { id: 'question', label: 'Question', color: 'var(--accent-blue)' },
  { id: 'alert', label: 'Field Alert', color: 'var(--accent-rose)' },
]

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

function getExplorerId(userId) {
  return userId || 'usr_unknown'
}

export default function Feed() {
  const { feed, createPost, likePost, addComment, destinations } = useData()
  const { user } = useAuth()
  const [postText, setPostText] = useState('')
  const [postImage, setPostImage] = useState('')
  const [postFlair, setPostFlair] = useState('note')
  const [activeTab, setActiveTab] = useState('notes')
  const [commentText, setCommentText] = useState({})
  const [expandedComments, setExpandedComments] = useState({})

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  const handleCreatePost = (e) => {
    e.preventDefault()
    if (!postText.trim() || !user) return
    createPost({
      user: user.name,
      avatar: user.avatar,
      text: postText,
      image: postImage,
      flair: postFlair,
      country: ''
    })
    setPostText('')
    setPostImage('')
    setPostFlair('note')
  }

  const handleComment = (e, postId) => {
    e.preventDefault()
    const text = commentText[postId]
    if (!text?.trim() || !user) return
    addComment(postId, {
      id: 'c' + Date.now(),
      user: user.name,
      avatar: user.avatar,
      text: text,
      timestamp: new Date().toISOString()
    })
    setCommentText({ ...commentText, [postId]: '' })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPostImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="page" style={{ background: 'var(--bg-main)' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 60, alignItems: 'start' }}>
        
        {/* Main Feed Column */}
        <div style={{ maxWidth: 650 }}>
          <div className="animate-fade-up" style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', fontWeight: 600, marginBottom: 12 }}>Network <span className="text-gradient">Notes</span></h1>
            <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border-subtle)' }}>
              {['Notes', 'Missions', 'Updates'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  style={{ 
                    padding: '12px 0', 
                    background: 'none', border: 'none', 
                    color: activeTab === tab.toLowerCase() ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                    borderBottom: activeTab === tab.toLowerCase() ? '2px solid var(--accent-gold)' : '2px solid transparent',
                    marginBottom: -1,
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Create Post (Substack Note Style) */}
          {user && activeTab === 'notes' && (
            <div className="animate-fade-up" style={{ marginBottom: 40, display: 'flex', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#000', flexShrink: 0 }}>
                {user.avatar}
              </div>
              <form onSubmit={handleCreatePost} style={{ flex: 1 }}>
                <textarea 
                  className="form-input" 
                  placeholder="Share a travel note..." 
                  style={{ width: '100%', minHeight: 60, border: 'none', background: 'transparent', padding: '12px 0', fontSize: '1.1rem', resize: 'none' }}
                  value={postText}
                  onChange={e => setPostText(e.target.value)}
                />
                
                {postImage && (
                  <div style={{ marginBottom: 16, position: 'relative', width: 'fit-content' }}>
                    <img src={postImage} alt="Upload preview" style={{ maxHeight: 200, borderRadius: 8, display: 'block' }} />
                    <button 
                      type="button" 
                      onClick={() => setPostImage('')}
                      style={{ position: 'absolute', top: -10, right: -10, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Flair Selection */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {FLAIRS.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPostFlair(f.id)}
                      style={{ 
                        padding: '4px 12px', 
                        fontSize: '0.75rem', 
                        borderRadius: 100, 
                        border: '1px solid',
                        borderColor: postFlair === f.id ? f.color : 'var(--border-subtle)',
                        background: postFlair === f.id ? `${f.color}15` : 'transparent',
                        color: postFlair === f.id ? f.color : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Tag size={10} /> {f.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: postImage ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                      <Image size={18} /> {postImage ? 'Image Selected' : 'Upload Image'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  <button type="submit" className="btn-primary btn-small" style={{ borderRadius: 100, padding: '8px 20px' }}>
                    Post
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {feed.map((item, i) => (
              <div key={item.id} className="feed-card animate-fade-up">
                <div style={{ display: 'flex', gap: 16 }}>
                  {/* Author Info */}
                  <Link to={`/explorer/${getExplorerId(item.user)}`} style={{ flexShrink: 0 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                      {item.avatar}
                    </div>
                  </Link>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Link to={`/explorer/${getExplorerId(item.user)}`} style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', textDecoration: 'none', fontFamily: 'var(--font-serif)' }}>
                        {item.user}
                      </Link>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>• {timeAgo(item.timestamp)}</span>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      {item.type === 'verified_stay' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--accent-teal-glow)', color: 'var(--accent-teal)', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600, marginBottom: 8 }}>
                          <Shield size={12} /> Verified Stay
                        </div>
                      )}
                      {item.type === 'test_mission_report' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--accent-gold-glow)', color: 'var(--accent-gold)', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600, marginBottom: 8 }}>
                          <Zap size={12} /> Mission Field Report
                        </div>
                      )}
                      {item.flair && item.flair !== 'note' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: `${FLAIRS.find(f => f.id === item.flair)?.color || 'var(--accent-teal)'}15`, color: FLAIRS.find(f => f.id === item.flair)?.color || 'var(--accent-teal)', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600, marginBottom: 8 }}>
                          <Tag size={12} /> {FLAIRS.find(f => f.id === item.flair)?.label || 'Update'}
                        </div>
                      )}
                      <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.6, fontFamily: 'var(--font-sans)' }}>{item.text}</p>
                    </div>

                    {item.image && (
                      <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <img src={item.image} alt="Post attachment" style={{ width: '100%', display: 'block' }} />
                      </div>
                    )}

                    {/* Interactions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 16 }}>
                      <button 
                        onClick={() => likePost(item.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: item.likes > 0 ? '#ff4d6d' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <Heart size={18} fill={item.likes > 0 ? '#ff4d6d' : 'none'} color={item.likes > 0 ? '#ff4d6d' : 'currentColor'} /> {item.likes}
                      </button>
                      <button 
                        onClick={() => toggleComments(item.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: expandedComments[item.id] ? 'var(--accent-gold)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <MessageSquare size={18} color={expandedComments[item.id] ? 'var(--accent-gold)' : 'currentColor'} /> {item.comments?.length || 0}
                      </button>
                    </div>

                    {/* Professional Comment Section */}
                    {expandedComments[item.id] && (
                      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
                        {/* Existing Comments */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: user ? 24 : 0 }}>
                          {item.comments?.map(c => (
                            <div key={c.id} style={{ display: 'flex', gap: 12 }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
                                {c.avatar || c.user.substring(0, 2).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: '0 16px 16px 16px', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.user}</span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.timestamp ? timeAgo(c.timestamp) : ''}</span>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{c.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Standard Comment Input (Pro style) */}
                        {user && (
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#000', flexShrink: 0 }}>
                              {user.avatar}
                            </div>
                            <form onSubmit={(e) => handleComment(e, item.id)} style={{ flex: 1, position: 'relative' }}>
                              <input 
                                className="form-input" 
                                placeholder="Add a comment..." 
                                style={{ 
                                  width: '100%', 
                                  padding: '10px 100px 10px 16px', 
                                  borderRadius: 100, 
                                  fontSize: '0.9rem',
                                  background: 'var(--bg-secondary)',
                                  border: '1px solid var(--border-subtle)'
                                }}
                                value={commentText[item.id] || ''}
                                onChange={e => setCommentText({ ...commentText, [item.id]: e.target.value })}
                              />
                              <button 
                                type="submit" 
                                className="btn-primary btn-small" 
                                disabled={!commentText[item.id]?.trim()}
                                style={{ 
                                  position: 'absolute', 
                                  right: 4, 
                                  top: 4, 
                                  borderRadius: 100, 
                                  padding: '6px 16px', 
                                  fontSize: '0.75rem',
                                  opacity: commentText[item.id]?.trim() ? 1 : 0.5
                                }}
                              >
                                Post
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 100 }}>
          {/* Trending Countries */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 32, background: 'transparent' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="var(--accent-gold)" /> Trending Destinations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {destinations.slice(0, 3).map((dest, i) => (
                <Link key={dest.id} to={`/destinations/${dest.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)', width: 24 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{dest.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dest.staysCount} active explorers</div>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/destinations" style={{ display: 'block', marginTop: 20, fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600, textDecoration: 'none' }}>
              View all countries →
            </Link>
          </div>

          {/* Top Explorers */}
          <div className="glass-card" style={{ padding: 24, background: 'transparent' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={18} color="var(--accent-teal)" /> Top Contributors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contributors will appear here as they join the network.</p>
            </div>
          </div>
          
          <div style={{ marginTop: 40, padding: 20, borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <p>© 2026 World Travelers Forum</p>
            <p>Coordination Layer for the Global Nomad.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
