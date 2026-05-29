import { useParams, Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useState, useMemo, useRef, useEffect } from 'react'
import { ArrowLeft, Send, MessageSquare, Shield, Users, Check, Plus, ThumbsUp, Reply, X, HelpCircle, Wifi, Car, Utensils, DollarSign, Globe, MapPin, Info, Edit3, Trash2, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react'

const TOPICS = [
  { id: 'visa', label: 'Visas & Entry', icon: <Globe size={14} /> },
  { id: 'safety', label: 'Safety', icon: <Shield size={14} /> },
  { id: 'internet', label: 'Internet & SIM', icon: <Wifi size={14} /> },
  { id: 'transport', label: 'Getting Around', icon: <Car size={14} /> },
  { id: 'food', label: 'Food & Culture', icon: <Utensils size={14} /> },
  { id: 'budget', label: 'Cost & Budget', icon: <DollarSign size={14} /> },
  { id: 'accommodation', label: 'Where to Stay', icon: <MapPin size={14} /> },
  { id: 'general', label: 'General', icon: <MessageSquare size={14} /> },
]

const RESOURCE_ICONS = {
  globe: <Globe size={18} />,
  shield: <Shield size={18} />,
  wifi: <Wifi size={18} />,
  car: <Car size={18} />,
  'map-pin': <MapPin size={18} />,
  dollar: <DollarSign size={18} />,
  utensils: <Utensils size={18} />,
}

const INITIAL_REPLIES = 3

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

function Avatar({ name, size = 36, style: extStyle }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, flexShrink: 0,
      background: 'var(--bg-elevated)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${Math.round(size * 0.42)}px`, fontWeight: 700,
      color: 'var(--accent-teal)', overflow: 'hidden',
      ...extStyle
    }}>
      {name?.substring(0, 2).toUpperCase() || '?'}
    </div>
  )
}

function ReplyBanner({ replyTarget, onCancel }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16,
      padding: '12px 16px', background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)',
      borderLeft: '3px solid var(--accent-gold)'
    }}>
      <CornerDownRight size={16} style={{ marginTop: 2, flexShrink: 0, color: 'var(--accent-gold)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: 2 }}>
          Replying to @{replyTarget.user}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {replyTarget.text}
        </div>
      </div>
      <button onClick={onCancel} style={{
        border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer',
        padding: 2, display: 'flex', borderRadius: 4, flexShrink: 0
      }}>
        <X size={16} />
      </button>
    </div>
  )
}

function PostActions({ post, user, onReply, onEdit, onDelete, helpful, onHelpful }) {
  if (post.parentId) return null
  return (
    <div style={{ display: 'flex', gap: 16, marginTop: 10, alignItems: 'center' }}>
      <button onClick={onReply} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: '0.75rem', color: 'var(--text-muted)',
        border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
        transition: 'color 0.15s'
      }}>
        <Reply size={13} /> Reply
      </button>
      <button onClick={onHelpful} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: '0.75rem',
        color: helpful ? 'var(--accent-teal)' : 'var(--text-muted)',
        border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
        transition: 'color 0.15s'
      }}>
        <ThumbsUp size={13} fill={helpful ? 'var(--accent-teal)' : 'none'} /> Helpful
      </button>
      {user && post.userId === user.id && (
        <>
          <button onClick={onEdit} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: '0.75rem', color: 'var(--text-muted)',
            border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'color 0.15s'
          }}>
            <Edit3 size={13} /> Edit
          </button>
          <button onClick={onDelete} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: '0.75rem', color: 'var(--text-danger, #ef4444)',
            border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'color 0.15s'
          }}>
            <Trash2 size={13} /> Delete
          </button>
        </>
      )}
    </div>
  )
}

function EditForm({ text, onSave, onCancel }) {
  const [val, setVal] = useState(text)
  const ref = useRef(null)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.setSelectionRange(val.length, val.length)
  }, [])

  return (
    <div style={{ marginTop: 8 }}>
      <textarea
        ref={ref}
        value={val}
        onChange={e => setVal(e.target.value)}
        className="form-input"
        style={{ width: '100%', minHeight: 60, padding: '8px 10px', fontSize: '0.85rem', resize: 'vertical', fontFamily: 'inherit' }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <button onClick={() => onSave(val)} className="btn-primary btn-small" disabled={!val.trim()} style={{ padding: '5px 14px', fontSize: '0.78rem', opacity: val.trim() ? 1 : 0.4 }}>
          Save
        </button>
        <button onClick={onCancel} className="btn-secondary btn-small" style={{ padding: '5px 14px', fontSize: '0.78rem' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

function ReplyThread({ post, replies, replyingTo, onReply, helpfulPosts, toggleHelpful, editingPost, setEditingPost, editDiscussionPost, deleteDiscussionPost, user, destId, msgText, setMsgText, handleSend }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? replies : replies.slice(0, INITIAL_REPLIES)
  const hasMore = replies.length > INITIAL_REPLIES

  if (replies.length === 0 && replyingTo?.id !== post.id) return null

  return (
    <div style={{ marginTop: 14, paddingLeft: 8 }}>
      {visible.map(r => (
        <div key={r.id} style={{
          position: 'relative', padding: '10px 14px 10px 20px', marginBottom: 8,
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          borderLeft: editingPost?.id === r.id ? '3px solid var(--accent-gold)' : '2px solid var(--border-subtle)',
        }}>
          <div style={{
            position: 'absolute', left: -6, top: 18, width: 8, height: 8,
            borderRadius: '50%', background: 'var(--accent-gold)',
            opacity: 0.5
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{r.user}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{formatTime(r.timestamp)}</span>
              {r.edited && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>edited</span>}
            </div>
            {user && r.userId === user.id && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setEditingPost(editingPost?.id === r.id ? null : { id: r.id, text: r.text })} style={{
                  border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex'
                }}>
                  <Edit3 size={11} />
                </button>
                <button onClick={() => { if (confirm('Delete this reply?')) deleteDiscussionPost(destId, r.id) }} style={{
                  border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-danger, #ef4444)', padding: 2, display: 'flex'
                }}>
                  <Trash2 size={11} />
                </button>
              </div>
            )}
          </div>

          {editingPost?.id === r.id ? (
            <EditForm text={editingPost.text} onSave={(t) => { editDiscussionPost(destId, r.id, t); setEditingPost(null) }} onCancel={() => setEditingPost(null)} />
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.text}</p>
          )}
        </div>
      ))}

      {hasMore && !showAll && (
        <button onClick={() => setShowAll(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 4,
          fontSize: '0.78rem', color: 'var(--accent-teal)', fontWeight: 600,
          border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
          padding: '6px 12px', borderRadius: 'var(--radius-sm)'
        }}>
          <ChevronDown size={14} /> Load {replies.length - INITIAL_REPLIES} more replies
        </button>
      )}

      {showAll && hasMore && (
        <button onClick={() => setShowAll(false)} style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 4,
          fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600,
          border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
          padding: '6px 12px', borderRadius: 'var(--radius-sm)'
        }}>
          <ChevronUp size={14} /> Show less
        </button>
      )}

      {replyingTo?.id === post.id && (
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            className="form-input"
            placeholder={`Reply to ${post.user}...`}
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
            value={msgText}
            onChange={e => setMsgText(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary btn-small" disabled={!msgText.trim()} style={{ padding: '8px 12px', opacity: msgText.trim() ? 1 : 0.4 }}>
            <Send size={15} />
          </button>
        </form>
      )}
    </div>
  )
}

export default function DestinationDiscussion() {
  const { id } = useParams()
  const { user } = useAuth()
  const {
    destinations, discussions, postToDiscussion,
    followedDestinations, joinDestination, leaveDestination,
    destinationMembers, allProfiles,
    destinationResources, addResourceTip, DEFAULT_RESOURCES,
    editDiscussionPost, deleteDiscussionPost
  } = useData()
  const [msgText, setMsgText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [activeTab, setActiveTab] = useState('discussion')
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [helpfulPosts, setHelpfulPosts] = useState({})
  const [showAsk, setShowAsk] = useState(false)
  const [askTopic, setAskTopic] = useState('general')
  const [resourceTipInput, setResourceTipInput] = useState({})
  const [editingPost, setEditingPost] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [expandedEditor, setExpandedEditor] = useState(null)
  const [previewTip, setPreviewTip] = useState(null)
  const [tipSearch, setTipSearch] = useState({})
  const [tipSortOrder, setTipSortOrder] = useState({})
  const [tipPages, setTipPages] = useState({})
  const MAX_TIP_LEN = 2000
  const TIPS_PER_PAGE = 5

  const country = destinations.find(d => d.id === id)
  const posts = discussions[id] || []
  const isFollowing = followedDestinations?.includes(id)
  const members = destinationMembers?.[id] || []
  const memberProfiles = members.map(mid => allProfiles.find(p => p.id === mid)).filter(Boolean)
  const resources = destinationResources[id] || DEFAULT_RESOURCES.map(r => ({ ...r }))

  const toggleHelpful = (postId) => {
    setHelpfulPosts(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!msgText.trim() || !user) return
    postToDiscussion(id, {
      text: msgText,
      parentId: replyingTo?.id,
      topic: replyingTo ? undefined : askTopic
    })
    setMsgText('')
    setReplyingTo(null)
  }

  const handleAskSubmit = (e) => {
    e.preventDefault()
    if (!msgText.trim() || !user) return
    postToDiscussion(id, { text: msgText, topic: askTopic })
    setMsgText('')
    setShowAsk(false)
  }

  const handleEdit = (postId, newText) => {
    editDiscussionPost(id, postId, newText)
    setEditingPost(null)
  }

  const handleDelete = (postId) => {
    if (deleteConfirm === postId) {
      deleteDiscussionPost(id, postId)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(postId)
    }
  }

  const handleAddTip = (resourceId) => {
    const tip = resourceTipInput[resourceId]?.trim()
    if (!tip || !user) return
    addResourceTip(id, resourceId, tip)
    setResourceTipInput(prev => ({ ...prev, [resourceId]: '' }))
    setExpandedEditor(null)
    setPreviewTip(null)
  }

  const topPosts = useMemo(() => {
    const sorted = [...posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    if (selectedTopic) return sorted.filter(p => !p.parentId && p.topic === selectedTopic)
    return sorted.filter(p => !p.parentId)
  }, [posts, selectedTopic])

  const replies = useMemo(() => posts.filter(p => p.parentId), [posts])

  const getReplies = (postId) => {
    return replies.filter(r => r.parentId === postId).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }

  const topicCounts = useMemo(() => {
    const counts = {}
    for (const t of TOPICS) {
      counts[t.id] = posts.filter(p => p.topic === t.id).length
    }
    return counts
  }, [posts])

  const wrapText = (rscId, before, after) => {
    const el = document.getElementById(`tip-${rscId}`)
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const val = resourceTipInput[rscId] || ''
    const selected = val.substring(start, end) || 'text'
    const newVal = val.substring(0, start) + before + selected + after + val.substring(end)
    setResourceTipInput(prev => ({ ...prev, [rscId]: newVal }))
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = start + before.length
      el.selectionEnd = start + before.length + selected.length
    })
  }

  const insertBullet = (rscId) => {
    const el = document.getElementById(`tip-${rscId}`)
    if (!el) return
    const val = resourceTipInput[rscId] || ''
    const newVal = val + (val && !val.endsWith('\n') ? '\n' : '') + '- '
    setResourceTipInput(prev => ({ ...prev, [rscId]: newVal }))
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = newVal.length
      el.selectionEnd = newVal.length
    })
  }

  const ToolbarButton = ({ label, onClick, title, style }) => (
    <button type="button" onClick={onClick} title={title} style={{
      fontSize: '0.72rem', fontWeight: 700, padding: '2px 7px',
      border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-xs)', cursor: 'pointer', color: 'var(--text-secondary)',
      fontFamily: 'inherit', lineHeight: 1.5, ...style
    }}>
      {label}
    </button>
  )

  const TipMarkdown = ({ text }) => {
    if (!text) return null
    const html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:var(--bg-secondary);padding:1px 4px;border-radius:3px;font-size:0.85em">$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--accent-teal)">$1</a>')
      .replace(/\n/g, '<br>')
    return <span dangerouslySetInnerHTML={{ __html: html }} />
  }

  if (!country) return <div className="page"><div className="container">Country not found.</div></div>

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 900 }}>
        <Link to="/destinations" className="nav-link" style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeft size={16} /> Back to Countries
        </Link>

        {/* HERO */}
        <div className="glass-card animate-fade-up" style={{
          padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden',
          background: country.image ? `linear-gradient(135deg, var(--bg-card) 0%, rgba(0,0,0,0.7) 100%), url(${country.image}) center/cover` : 'var(--bg-card)'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h1 style={{ fontSize: '2rem' }}>{country.name}</h1>
                  {country.country !== country.name && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{country.country}</span>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 500, lineHeight: 1.6 }}>{country.description}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {user && (
                  <button
                    onClick={() => isFollowing ? leaveDestination(id) : joinDestination(id)}
                    className={`btn-${isFollowing ? 'secondary' : 'primary'} btn-small`}
                    style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                  >
                    {isFollowing ? <><Check size={14} /> Following</> : <><Plus size={14} /> Follow</>}
                  </button>
                )}
                <button className="btn-secondary btn-small" style={{ padding: '8px 14px', fontSize: '0.8rem', cursor: 'default' }}>
                  <Users size={14} /> {members.length}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
              {[
                { icon: <MapPin size={14} />, value: `${country.explorers || members.length}`, label: 'Explorers' },
                { icon: <MessageSquare size={14} />, value: `${country.discussionsCount || posts.length}`, label: 'Discussions' },
                { icon: <Shield size={14} />, value: `${country.staysCount || 0}`, label: 'Verified Stays' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--accent-gold)' }}>{s.icon}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QUICK INFO RESOURCES */}
        {activeTab === 'discussion' && resources.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 24 }}>
            {resources.map(rsc => {
              const isEditorOpen = expandedEditor === rsc.id
              const isPreviewing = previewTip === rsc.id
              const tipText = resourceTipInput[rsc.id] || ''
              const tipLen = tipText.length

              return (
                <div key={rsc.id} className="glass-card" style={{
                  padding: 16, borderLeft: '3px solid var(--accent-teal)',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ color: 'var(--accent-teal)' }}>{RESOURCE_ICONS[rsc.icon] || <Info size={18} />}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{rsc.label}</span>
                    {rsc.tips.length > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {rsc.tips.length} tip{rsc.tips.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Tips display */}
                  {rsc.tips.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      {/* Search + Sort bar */}
                      {rsc.tips.length > 3 && (
                        <div style={{ display: 'flex', gap: 4, marginBottom: 6, alignItems: 'center' }}>
                          <input
                            placeholder="Search tips..."
                            value={tipSearch[rsc.id] || ''}
                            onChange={e => {
                              setTipSearch(prev => ({ ...prev, [rsc.id]: e.target.value }))
                              setTipPages(prev => ({ ...prev, [rsc.id]: 1 }))
                            }}
                            style={{
                              flex: 1, padding: '4px 8px', fontSize: '0.7rem',
                              border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)',
                              background: 'var(--bg-elevated)', color: 'inherit', fontFamily: 'inherit',
                              outline: 'none', minWidth: 0
                            }}
                          />
                          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                            <button
                              onClick={() => setTipSortOrder(prev => ({ ...prev, [rsc.id]: 'newest' }))}
                              style={{
                                fontSize: '0.6rem', fontWeight: 600, padding: '3px 6px',
                                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)',
                                background: (tipSortOrder[rsc.id] || 'newest') === 'newest' ? 'var(--accent-teal-glow)' : 'var(--bg-elevated)',
                                color: (tipSortOrder[rsc.id] || 'newest') === 'newest' ? 'var(--accent-teal)' : 'var(--text-muted)',
                                cursor: 'pointer', fontFamily: 'inherit'
                              }}
                            >
                              Newest
                            </button>
                            <button
                              onClick={() => setTipSortOrder(prev => ({ ...prev, [rsc.id]: 'oldest' }))}
                              style={{
                                fontSize: '0.6rem', fontWeight: 600, padding: '3px 6px',
                                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)',
                                background: tipSortOrder[rsc.id] === 'oldest' ? 'var(--accent-teal-glow)' : 'var(--bg-elevated)',
                                color: tipSortOrder[rsc.id] === 'oldest' ? 'var(--accent-teal)' : 'var(--text-muted)',
                                cursor: 'pointer', fontFamily: 'inherit'
                              }}
                            >
                              Oldest
                            </button>
                          </div>
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {(() => {
                          const q = (tipSearch[rsc.id] || '').toLowerCase()
                          const filtered = q
                            ? rsc.tips.filter(t => t.text.toLowerCase().includes(q) || (t.user && t.user.toLowerCase().includes(q)))
                            : [...rsc.tips]
                          const sorted = filtered.sort((a, b) => {
                            return (tipSortOrder[rsc.id] || 'newest') === 'newest'
                              ? new Date(b.timestamp) - new Date(a.timestamp)
                              : new Date(a.timestamp) - new Date(b.timestamp)
                          })
                          const totalPages = Math.max(1, Math.ceil(sorted.length / TIPS_PER_PAGE))
                          const currentPage = Math.min(tipPages[rsc.id] || 1, totalPages)
                          const pageTips = sorted.slice((currentPage - 1) * TIPS_PER_PAGE, currentPage * TIPS_PER_PAGE)

                          if (sorted.length === 0) {
                            return (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                                No tips match your search
                              </div>
                            )
                          }

                          return (
                            <>
                              {pageTips.map((tip, i) => (
                                <div key={i} style={{
                                  fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                                  padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)',
                                  borderLeft: '2px solid var(--accent-gold)', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                                }}>
                                  <TipMarkdown text={tip.text} />
                                  {tip.user && (
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>— {tip.user}</span>
                                  )}
                                </div>
                              ))}
                              {totalPages > 1 && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 6 }}>
                                  <button onClick={() => setTipPages(prev => ({ ...prev, [rsc.id]: currentPage - 1 }))}
                                    disabled={currentPage <= 1}
                                    style={{
                                      fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                                      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)',
                                      background: 'var(--bg-elevated)',
                                      color: currentPage <= 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                                      cursor: currentPage <= 1 ? 'default' : 'pointer', fontFamily: 'inherit',
                                      opacity: currentPage <= 1 ? 0.4 : 1
                                    }}
                                  >
                                    Prev
                                  </button>
                                  {(() => {
                                    const pages = []
                                    const start = Math.max(1, currentPage - 1)
                                    const end = Math.min(totalPages, start + 3)
                                    if (start > 1) pages.push(<span key="se" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '0 2px' }}>...</span>)
                                    for (let i = start; i <= end; i++) {
                                      pages.push(
                                        <button key={i} onClick={() => setTipPages(prev => ({ ...prev, [rsc.id]: i }))}
                                          style={{
                                            fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', minWidth: 26,
                                            border: '1px solid', borderRadius: 'var(--radius-xs)',
                                            borderColor: currentPage === i ? 'var(--accent-teal)' : 'var(--border-subtle)',
                                            background: currentPage === i ? 'var(--accent-teal-glow)' : 'var(--bg-elevated)',
                                            color: currentPage === i ? 'var(--accent-teal)' : 'var(--text-secondary)',
                                            cursor: 'pointer', fontFamily: 'inherit'
                                          }}
                                        >
                                          {i}
                                        </button>
                                      )
                                    }
                                    if (end < totalPages) pages.push(<span key="ee" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '0 2px' }}>...</span>)
                                    return pages
                                  })()}
                                  <button onClick={() => setTipPages(prev => ({ ...prev, [rsc.id]: currentPage + 1 }))}
                                    disabled={currentPage >= totalPages}
                                    style={{
                                      fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                                      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)',
                                      background: 'var(--bg-elevated)',
                                      color: currentPage >= totalPages ? 'var(--text-muted)' : 'var(--text-secondary)',
                                      cursor: currentPage >= totalPages ? 'default' : 'pointer', fontFamily: 'inherit',
                                      opacity: currentPage >= totalPages ? 0.4 : 1
                                    }}
                                  >
                                    Next
                                  </button>
                                </div>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Tip editor */}
                  {user && (
                    <div style={{ marginTop: rsc.tips.length > 0 ? 6 : 0 }}>
                      {!isEditorOpen ? (
                        <button onClick={() => setExpandedEditor(rsc.id)} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          fontSize: '0.75rem', color: 'var(--text-muted)',
                          border: '1px dashed var(--border-medium)', background: 'none',
                          cursor: 'pointer', fontFamily: 'inherit', padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)', width: '100%',
                          transition: 'all 0.15s'
                        }}>
                          <Plus size={12} /> Write a tip...
                        </button>
                      ) : (
                        <div>
                          {/* Formatting toolbar */}
                          <div style={{ display: 'flex', gap: 2, marginBottom: 6, alignItems: 'center' }}>
                            <ToolbarButton label="B" onClick={() => wrapText(rsc.id, '**', '**')} title="Bold (Ctrl+B)" />
                            <ToolbarButton label="I" onClick={() => wrapText(rsc.id, '*', '*')} title="Italic (Ctrl+I)" style={{ fontStyle: 'italic' }} />
                            <ToolbarButton label="🔗" onClick={() => wrapText(rsc.id, '[', '](url)')} title="Link" />
                            <ToolbarButton label="•" onClick={() => insertBullet(rsc.id)} title="Bullet list" />
                            <span style={{ flex: 1 }} />
                            <button onClick={() => setPreviewTip(isPreviewing ? null : rsc.id)} style={{
                              fontSize: '0.7rem', fontWeight: 600,
                              color: isPreviewing ? 'var(--accent-teal)' : 'var(--text-muted)',
                              border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                              padding: '2px 6px'
                            }}>
                              {isPreviewing ? '✏️ Edit' : '👁️ Preview'}
                            </button>
                            <button onClick={() => { setExpandedEditor(null); setPreviewTip(null) }} style={{
                              fontSize: '0.7rem', color: 'var(--text-muted)',
                              border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                              padding: '2px 6px', display: 'flex'
                            }}>
                              <X size={14} />
                            </button>
                          </div>

                          {/* Editor / Preview */}
                          {isPreviewing ? (
                            <div style={{
                              fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                              padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xs)',
                              minHeight: 60, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                              border: '1px solid var(--border-subtle)'
                            }}>
                              {tipText.trim() ? <TipMarkdown text={tipText} /> : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nothing to preview yet</span>}
                            </div>
                          ) : (
                            <textarea
                              id={`tip-${rsc.id}`}
                              className="form-input"
                              placeholder={`Share your ${rsc.label.toLowerCase()} experience, tips, and advice...`}
                              style={{
                                width: '100%', minHeight: 60, padding: '8px 10px',
                                fontSize: '0.82rem', resize: 'vertical', fontFamily: 'inherit',
                                lineHeight: 1.5
                              }}
                              value={tipText}
                              onChange={e => {
                                if (e.target.value.length <= MAX_TIP_LEN) {
                                  setResourceTipInput(prev => ({ ...prev, [rsc.id]: e.target.value }))
                                }
                              }}
                              autoFocus
                            />
                          )}

                          {/* Bottom bar: char count + submit */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                            <span style={{
                              fontSize: '0.65rem',
                              color: tipLen > MAX_TIP_LEN * 0.9 ? 'var(--text-danger, #ef4444)' : 'var(--text-muted)'
                            }}>
                              {tipLen}/{MAX_TIP_LEN}
                            </span>
                            <button onClick={() => handleAddTip(rsc.id)} className="btn-primary btn-small" style={{
                              padding: '5px 14px', fontSize: '0.78rem',
                              opacity: tipText.trim() ? 1 : 0.4,
                              pointerEvents: tipText.trim() ? 'auto' : 'none'
                            }}>
                              <Plus size={12} /> Add Tip
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'discussion', label: 'Discussions', icon: <MessageSquare size={16} /> },
            { id: 'members', label: 'Members', icon: <Users size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px', fontSize: '0.9rem', fontWeight: 600,
                color: activeTab === tab.id ? 'var(--accent-gold)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-gold)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* DISCUSSION TAB */}
        {activeTab === 'discussion' && (
          <>
            {/* Reply Banner — sticky bar when replying */}
            {replyingTo && (
              <div style={{ position: 'sticky', top: 0, zIndex: 10, marginBottom: 16 }}>
                <ReplyBanner replyTarget={replyingTo} onCancel={() => { setReplyingTo(null); setMsgText('') }} />
              </div>
            )}

            {/* Ask a Question Bar */}
            {user && !showAsk && !replyingTo && (
              <button onClick={() => setShowAsk(true)} className="glass-card" style={{
                padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
                color: 'var(--text-muted)', fontSize: '0.95rem', width: '100%', textAlign: 'left',
                border: '1px dashed var(--border-medium)', cursor: 'pointer', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)', fontFamily: 'inherit'
              }}>
                <HelpCircle size={18} style={{ color: 'var(--accent-gold)' }} />
                Ask a question about {country.name}...
              </button>
            )}

            {/* Ask Form */}
            {showAsk && (
              <div className="glass-card" style={{ padding: 20, marginBottom: 20, border: '1px solid var(--accent-gold-glow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: '1rem' }}>Ask the Community</h3>
                  <button onClick={() => { setShowAsk(false); setReplyingTo(null) }} style={{ color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  {TOPICS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setAskTopic(t.id)}
                      style={{
                        padding: '4px 12px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
                        background: askTopic === t.id ? 'var(--accent-gold-glow)' : 'var(--bg-elevated)',
                        color: askTopic === t.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        border: '1px solid', borderColor: askTopic === t.id ? 'var(--accent-gold)' : 'var(--border-subtle)',
                        cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4
                      }}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleAskSubmit} style={{ display: 'flex', gap: 10 }}>
                  <input
                    className="form-input"
                    placeholder={`Ask about ${TOPICS.find(t => t.id === askTopic)?.label.toLowerCase()} in ${country.name}...`}
                    style={{ flex: 1 }}
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="btn-primary" disabled={!msgText.trim()} style={{ padding: '12px 18px', opacity: msgText.trim() ? 1 : 0.4 }}>
                    <Send size={18} />
                  </button>
                </form>
              </div>
            )}

            {/* Topic Filters */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedTopic(null)}
                style={{
                  padding: '5px 14px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
                  background: !selectedTopic ? 'var(--accent-gold-glow)' : 'var(--bg-elevated)',
                  color: !selectedTopic ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  border: '1px solid', borderColor: !selectedTopic ? 'var(--accent-gold)' : 'var(--border-subtle)',
                  cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                All ({posts.filter(p => !p.parentId).length})
              </button>
              {TOPICS.map(t => {
                const count = topicCounts[t.id] || 0
                if (count === 0) return null
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTopic(selectedTopic === t.id ? null : t.id)}
                    style={{
                      padding: '5px 14px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
                      background: selectedTopic === t.id ? 'var(--accent-teal-glow)' : 'var(--bg-elevated)',
                      color: selectedTopic === t.id ? 'var(--accent-teal)' : 'var(--text-secondary)',
                      border: '1px solid', borderColor: selectedTopic === t.id ? 'var(--accent-teal)' : 'var(--border-subtle)',
                      cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4
                    }}
                  >
                    {t.icon} {t.label}
                    <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>{count}</span>
                  </button>
                )
              })}
            </div>

            {/* Discussion Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topPosts.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <MessageSquare size={48} style={{ marginBottom: 16, opacity: 0.2, color: 'var(--text-muted)' }} />
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                    {selectedTopic ? 'No discussions in this topic yet' : `No discussions yet in ${country.name}`}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {selectedTopic ? `Be the first to ask about ${TOPICS.find(t => t.id === selectedTopic)?.label.toLowerCase()}!` : 'Be the first to start the conversation!'}
                  </p>
                  {user && !showAsk && (
                    <button onClick={() => setShowAsk(true)} className="btn-primary btn-small" style={{ marginTop: 20 }}>
                      <Plus size={16} /> Start a Discussion
                    </button>
                  )}
                </div>
              ) : (
                topPosts.map((post) => {
                  const postReplies = getReplies(post.id)
                  const topicInfo = TOPICS.find(t => t.id === post.topic)
                  const isHighlighted = replyingTo?.id === post.id

                  return (
                    <div key={post.id} className="glass-card animate-fade-in" style={{
                      padding: 20, display: 'flex', gap: 14,
                      border: isHighlighted ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      borderLeft: isHighlighted ? '3px solid var(--accent-gold)' : topicInfo ? '3px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      boxShadow: isHighlighted ? '0 0 0 1px var(--accent-gold-glow)' : 'none',
                      transition: 'all 0.15s'
                    }}>
                      <Avatar name={post.user} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{post.user}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatTime(post.timestamp)}</span>
                            {post.edited && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>edited</span>}
                          </div>
                          {topicInfo && (
                            <span className="badge badge-gold" style={{ fontSize: '0.6rem', padding: '2px 8px', gap: 4 }}>
                              {topicInfo.icon} {topicInfo.label}
                            </span>
                          )}
                        </div>

                        {editingPost?.id === post.id ? (
                          <EditForm text={editingPost.text} onSave={(t) => handleEdit(post.id, t)} onCancel={() => setEditingPost(null)} />
                        ) : (
                          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{post.text}</p>
                        )}

                        <PostActions
                          post={post}
                          user={user}
                          helpful={helpfulPosts[post.id]}
                          onHelpful={() => toggleHelpful(post.id)}
                          onReply={() => setReplyingTo(replyingTo?.id === post.id ? null : { id: post.id, user: post.user, text: post.text })}
                          onEdit={() => setEditingPost(editingPost?.id === post.id ? null : { id: post.id, text: post.text })}
                          onDelete={() => {
                            if (deleteConfirm === post.id) {
                              handleDelete(post.id)
                            } else {
                              setDeleteConfirm(post.id)
                              setTimeout(() => setDeleteConfirm(null), 3000)
                            }
                          }}
                        />

                        {deleteConfirm === post.id && (
                          <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-danger, #ef4444)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>Click Delete again to confirm</span>
                            <button onClick={() => setDeleteConfirm(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit', textDecoration: 'underline' }}>Cancel</button>
                          </div>
                        )}

                        {/* Threaded replies with load-more */}
                        <ReplyThread
                          post={post}
                          replies={postReplies}
                          replyingTo={replyingTo}
                          onReply={() => {}}
                          helpfulPosts={helpfulPosts}
                          toggleHelpful={toggleHelpful}
                          editingPost={editingPost}
                          setEditingPost={setEditingPost}
                          editDiscussionPost={editDiscussionPost}
                          deleteDiscussionPost={deleteDiscussionPost}
                          user={user}
                          destId={id}
                          msgText={msgText}
                          setMsgText={setMsgText}
                          handleSend={handleSend}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.1rem' }}>Explorers Following {country.name}</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{memberProfiles.length} members</span>
            </div>
            {memberProfiles.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {memberProfiles.map(p => (
                  <Link key={p.id} to={`/explorer/${p.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)', textDecoration: 'none', color: 'inherit',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: p.id === user?.id ? 'var(--accent-gold-glow)' : 'var(--bg-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700,
                      color: p.id === user?.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      overflow: 'hidden', flexShrink: 0
                    }}>
                      {p.avatar_url?.startsWith('http') ? (
                        <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (p.full_name || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.full_name}
                        {p.id === user?.id && <span style={{ color: 'var(--accent-teal)', fontSize: '0.75rem', marginLeft: 6 }}>(You)</span>}
                      </div>
                      {p.home_country && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.home_country}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Users size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
                <p style={{ fontSize: '0.9rem' }}>No one is following this destination yet.</p>
                {user && !isFollowing && (
                  <button onClick={() => joinDestination(id)} className="btn-primary btn-small" style={{ marginTop: 16 }}>
                    <Plus size={16} /> Be the first to follow
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}