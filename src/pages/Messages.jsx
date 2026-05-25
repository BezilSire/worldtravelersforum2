import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { Send, Search, User, MessageSquare, Edit3, Trash2, Smile, X, Check, ChevronLeft, Users } from 'lucide-react'

const REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🙏']

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDateGroup(ts) {
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined })
}

function groupByDate(messages) {
  const groups = []
  let currentDate = null
  for (const m of messages) {
    const dateLabel = formatDateGroup(m.timestamp)
    if (dateLabel !== currentDate) {
      currentDate = dateLabel
      groups.push({ date: dateLabel, items: [] })
    }
    groups[groups.length - 1].items.push(m)
  }
  return groups
}

function Avatar({ src, name, size = 36, style }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: 'var(--gradient-gold)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 700, color: '#000',
      flexShrink: 0, overflow: 'hidden',
      ...style
    }}>
      {src?.startsWith('http') || src?.startsWith('data:') ? (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        (name || '?').charAt(0).toUpperCase()
      )}
    </div>
  )
}

export default function Messages() {
  const { user } = useAuth()
  const { messages, sendMessage, groupChats, sendGroupMessage, allProfiles, dmHistory, editMessage, deleteMessage, reactToMessage } = useData()

  const [activeChat, setActiveChat] = useState(null)
  const [msgText, setMsgText] = useState('')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(null)
  const [showMobileList, setShowMobileList] = useState(true)
  const [showMenu, setShowMenu] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [newChatSearch, setNewChatSearch] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const listRef = useRef(null)
  const msgEndRef = useRef(null)
  const editRef = useRef(null)

  if (!user) return <Navigate to="/auth" />

  const dmConversations = useMemo(() => {
    return allProfiles
      .filter(p => p.id !== user.id)
      .map(profile => {
        const localMsgs = messages.filter(m => {
          if (m.fromId === user.id) return m.to === profile.id || m.to === profile.full_name
          if (m.fromId === profile.id) return true
          if (!m.fromId && m.from === profile.full_name) return true
          if (!m.fromId && m.from === user.full_name && (m.to === profile.id || m.to === profile.full_name)) return true
          return false
        })
        const historyMsgs = dmHistory.filter(m => {
          return (m.sender_id === user.id && m.receiver_id === profile.id) ||
                 (m.sender_id === profile.id && m.receiver_id === user.id)
        }).map(m => ({
          id: m.id,
          from: m.sender_name || profile.full_name,
          fromId: m.sender_id,
          to: m.receiver_id,
          text: m.text,
          timestamp: m.timestamp,
          reactions: m.reactions || {},
          edited: m.edited || false
        }))
        const seen = new Set()
        const all = [...localMsgs, ...historyMsgs].filter(m => {
          if (seen.has(m.id)) return false
          seen.add(m.id)
          return true
        })
        all.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0))
        const last = all[all.length - 1]
        return {
          id: profile.id,
          type: 'dm',
          name: profile.full_name || 'Explorer',
          avatar: profile.avatar_url,
          username: profile.username,
          lastMessage: last?.text || '',
          lastTime: last?.timestamp || '',
          messages: all
        }
      })
      .sort((a, b) => {
        if (!a.lastTime && !b.lastTime) return a.name.localeCompare(b.name)
        if (!a.lastTime) return 1
        if (!b.lastTime) return -1
        return new Date(b.lastTime) - new Date(a.lastTime)
      })
  }, [messages, dmHistory, allProfiles, user])

  const groupConversations = useMemo(() => {
    return groupChats
      .filter(gc => gc.participants?.includes(user.id))
      .map(gc => {
        const msgs = (gc.messages || []).slice().sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0))
        const last = msgs[msgs.length - 1]
        return {
          id: gc.id,
          type: 'group',
          name: gc.title || 'Mission Chat',
          avatar: null,
          participants: gc.participants || [],
          lastMessage: last?.text || '',
          lastTime: last?.timestamp || '',
          messages: msgs,
          memberCount: gc.participants?.length || 0
        }
      })
      .sort((a, b) => {
        if (!a.lastTime && !b.lastTime) return a.name.localeCompare(b.name)
        if (!a.lastTime) return 1
        if (!b.lastTime) return -1
        return new Date(b.lastTime) - new Date(a.lastTime)
      })
  }, [groupChats, user])

  const allConversations = useMemo(() => {
    return [...dmConversations, ...groupConversations]
  }, [dmConversations, groupConversations])

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return allConversations
    const q = search.toLowerCase()
    return allConversations.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.lastMessage || '').toLowerCase().includes(q)
    )
  }, [allConversations, search])

  const currentMessages = useMemo(() => {
    if (!activeChat) return []
    if (activeChat.type === 'dm') {
      const convo = dmConversations.find(c => c.id === activeChat.id)
      return convo?.messages || []
    }
    const convo = groupConversations.find(c => c.id === activeChat.id)
    return convo?.messages || []
  }, [activeChat, dmConversations, groupConversations])

  const currentTitle = activeChat
    ? activeChat.type === 'dm'
      ? dmConversations.find(c => c.id === activeChat.id)?.name || 'Chat'
      : groupConversations.find(c => c.id === activeChat.id)?.name || 'Group Chat'
    : ''

  const currentAvatar = activeChat?.type === 'dm'
    ? dmConversations.find(c => c.id === activeChat.id)?.avatar
    : null

  const currentParticipants = activeChat?.type === 'group'
    ? groupConversations.find(c => c.id === activeChat.id)?.memberCount
    : null

  const messageGroups = useMemo(() => groupByDate(currentMessages), [currentMessages])

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages])

  useEffect(() => {
    if (editingId && editRef.current) editRef.current.focus()
  }, [editingId])

  const handleSend = useCallback((e) => {
    e.preventDefault()
    if (!msgText.trim() || !activeChat) return
    if (activeChat.type === 'dm') {
      sendMessage({
        from: { id: user.id, name: user.full_name },
        to: activeChat.id,
        text: msgText
      })
    } else {
      sendGroupMessage(activeChat.id, {
        from: user.full_name,
        text: msgText
      })
    }
    setMsgText('')
  }, [msgText, activeChat, user, sendMessage, sendGroupMessage])

  const handleEdit = useCallback((msgId, currentText) => {
    setEditingId(msgId)
    setEditText(currentText)
    setShowMenu(null)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editingId || !editText.trim() || !activeChat) return
    editMessage(editingId, editText, activeChat.type)
    setEditingId(null)
    setEditText('')
  }, [editingId, editText, activeChat, editMessage])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditText('')
  }, [])

  const handleDelete = useCallback((msgId, type) => {
    setDeleteConfirm(msgId)
    setShowMenu(null)
  }, [])

  const confirmDelete = useCallback(() => {
    if (!deleteConfirm || !activeChat) return
    deleteMessage(deleteConfirm, activeChat.type)
    setDeleteConfirm(null)
  }, [deleteConfirm, activeChat, deleteMessage])

  const handleReaction = useCallback((msgId, emoji, type) => {
    reactToMessage(msgId, emoji, type)
    setShowEmojiPicker(null)
  }, [reactToMessage])

  const selectConversation = useCallback((convo) => {
    setActiveChat({ type: convo.type, id: convo.id })
    setShowMobileList(false)
    setSearch('')
  }, [])

  const hasReacted = (reactions, emoji) => {
    return reactions?.[emoji]?.includes(user.id) || false
  }

  const newChatProfiles = useMemo(() => {
    const messagedIds = new Set()
    for (const m of messages) {
      if (m.fromId === user.id && m.to) messagedIds.add(m.to)
      if (m.fromId && m.fromId !== user.id) messagedIds.add(m.fromId)
    }
    for (const m of dmHistory) {
      if (m.sender_id === user.id) messagedIds.add(m.receiver_id)
      if (m.receiver_id === user.id) messagedIds.add(m.sender_id)
    }
    const q = newChatSearch.toLowerCase()
    return allProfiles
      .filter(p => p.id !== user.id && !messagedIds.has(p.id) && !messagedIds.has(p.full_name))
      .filter(p => !q || p.full_name?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q))
  }, [allProfiles, user, messages, dmHistory, newChatSearch])

  const startNewChat = useCallback((profile) => {
    setActiveChat({ type: 'dm', id: profile.id })
    setShowNewChat(false)
    setShowMobileList(false)
  }, [])

  return (
    <div className="page messages-page">
      <div className="container messages-container">
        <h1 className="messages-heading">Explorer <span className="text-gradient">Messages</span></h1>

        {showNewChat && (
          <div className="modal-overlay" onClick={() => setShowNewChat(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
              <div className="modal-title">New Conversation</div>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" placeholder="Search explorers..." style={{ width: '100%', paddingLeft: 36 }} value={newChatSearch} onChange={e => setNewChatSearch(e.target.value)} />
              </div>
              {newChatProfiles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {allProfiles.length <= 1 ? 'No other explorers found.' : 'Already chatting with everyone!'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {newChatProfiles.map(p => (
                    <button key={p.id} onClick={() => startNewChat(p)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      borderRadius: 'var(--radius-md)', transition: 'background 0.2s',
                      textAlign: 'left', width: '100%'
                    }}
                      className="conversation-item"
                    >
                      <Avatar src={p.avatar_url} name={p.full_name} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.full_name}</div>
                        {p.username && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{p.username}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 360, textAlign: 'center' }}>
              <div className="modal-title" style={{ fontSize: '1.2rem' }}>Delete message?</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>This can't be undone.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn-secondary btn-small" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn-primary btn-small" onClick={confirmDelete} style={{ background: '#dc2626', backgroundImage: 'none' }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        <div className="messages-layout">
          {/* Sidebar */}
          <div className={`messages-sidebar ${!showMobileList ? 'hidden-mobile' : ''}`}>
            <div className="messages-sidebar-header">
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="form-input messages-search"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button className="btn-primary btn-small" onClick={() => setShowNewChat(true)} style={{ padding: '8px 12px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                <User size={16} /> New
              </button>
            </div>

            <div className="messages-conversation-list">
              {filteredConversations.length === 0 ? (
                <div className="messages-empty-state">
                  {search ? 'No conversations match your search.' : 'No conversations yet. Start one!'}
                </div>
              ) : (
                filteredConversations.map(convo => {
                  const isActive = activeChat?.id === convo.id && activeChat?.type === convo.type
                  return (
                    <button
                      key={`${convo.type}_${convo.id}`}
                      onClick={() => selectConversation(convo)}
                      className={`conversation-item ${isActive ? 'active' : ''}`}
                    >
                      {convo.type === 'dm' ? (
                        <Avatar src={convo.avatar} name={convo.name} size={40} />
                      ) : (
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: 'var(--accent-teal-glow)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <MessageSquare size={20} color="var(--accent-teal)" />
                        </div>
                      )}
                      <div className="conversation-info">
                        <div className="conversation-top">
                          <span className="conversation-name">{convo.name}</span>
                          {convo.lastTime && (
                            <span className="conversation-time">{formatTime(convo.lastTime)}</span>
                          )}
                        </div>
                        <div className="conversation-preview">
                          {convo.type === 'group' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 6, color: 'var(--accent-teal)' }}>
                              <Users size={12} />
                              {convo.memberCount}
                            </span>
                          )}
                          <span className="conversation-last">{convo.lastMessage || 'No messages yet'}</span>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`messages-chat ${showMobileList ? 'hidden-mobile' : ''}`}>
            {!activeChat ? (
              <div className="messages-empty-chat">
                <MessageSquare size={48} color="var(--text-muted)" style={{ opacity: 0.4 }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: 16, color: 'var(--text-secondary)' }}>
                  Select a conversation
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
                  Choose a chat from the sidebar or start a new one.
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="messages-chat-header">
                  <button className="mobile-back-btn" onClick={() => { setShowMobileList(true); setActiveChat(null) }}>
                    <ChevronLeft size={20} />
                  </button>
                  <Avatar src={currentAvatar} name={currentTitle} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="messages-chat-title">{currentTitle}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {activeChat.type === 'group'
                        ? `${currentParticipants || 0} members`
                        : 'Direct Message'
                      }
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="messages-list" ref={listRef}>
                  {messageGroups.length === 0 ? (
                    <div className="messages-empty-msgs">
                      No messages yet. Say hello!
                    </div>
                  ) : (
                    messageGroups.map((group, gi) => (
                      <div key={gi}>
                        <div className="messages-date-separator">
                          <span>{group.date}</span>
                        </div>
                        {group.items.map((msg, mi) => {
                          const isOwn = msg.fromId === user.id || msg.from === user.full_name
                          const isEditing = editingId === msg.id
                          return (
                            <div
                              key={msg.id || mi}
                              className={`message-row ${isOwn ? 'own' : 'other'}`}
                              onMouseLeave={() => setShowMenu(null)}
                            >
                              {!isOwn && <Avatar src={null} name={msg.from} size={28} style={{ marginTop: 4 }} />}
                              <div className="message-content">
                                <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                                  {activeChat.type === 'group' && !isOwn && (
                                    <div className="message-sender">{msg.from}</div>
                                  )}
                                  {isEditing ? (
                                    <div className="message-edit-inline">
                                      <input
                                        ref={editRef}
                                        className="form-input"
                                        value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') handleSaveEdit()
                                          if (e.key === 'Escape') handleCancelEdit()
                                        }}
                                        style={{ padding: '6px 10px', fontSize: '0.85rem', width: '100%' }}
                                      />
                                      <div className="message-edit-actions">
                                        <button onClick={handleSaveEdit} className="message-action-btn" style={{ color: 'var(--accent-teal)' }}>
                                          <Check size={14} />
                                        </button>
                                        <button onClick={handleCancelEdit} className="message-action-btn" style={{ color: 'var(--text-muted)' }}>
                                          <X size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="message-text">
                                      {msg.text}
                                      {msg.edited && <span className="message-edited"> (edited)</span>}
                                    </div>
                                  )}
                                  {!isEditing && (
                                    <div className="message-meta">
                                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Reactions */}
                                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                  <div className="message-reactions">
                                    {Object.entries(msg.reactions).map(([emoji, users]) => (
                                      <button
                                        key={emoji}
                                        className={`reaction-badge ${hasReacted(msg.reactions, emoji) ? 'reacted' : ''}`}
                                        onClick={() => handleReaction(msg.id, emoji, activeChat.type)}
                                      >
                                        <span>{emoji}</span>
                                        {users.length > 0 && <span>{users.length}</span>}
                                      </button>
                                    ))}
                                    <button className="reaction-add-btn" onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}>
                                      <Smile size={14} />
                                    </button>
                                  </div>
                                )}

                                {/* Emoji picker (inline) */}
                                {showEmojiPicker === msg.id && (
                                  <div className="emoji-picker">
                                    {REACTIONS.map(emoji => (
                                      <button
                                        key={emoji}
                                        className={`emoji-option ${hasReacted(msg.reactions || {}, emoji) ? 'active' : ''}`}
                                        onClick={() => handleReaction(msg.id, emoji, activeChat.type)}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {/* Message actions (own messages only) */}
                                {isOwn && !isEditing && (
                                  <div className="message-actions">
                                    <button onClick={() => handleEdit(msg.id, msg.text)} className="message-action-btn" title="Edit">
                                      <Edit3 size={13} />
                                    </button>
                                    <button onClick={() => handleDelete(msg.id, activeChat.type)} className="message-action-btn" title="Delete" style={{ color: 'var(--accent-rose, #ef4444)' }}>
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))
                  )}
                  <div ref={msgEndRef} />
                </div>

                {/* Input */}
                <form className="messages-input-area" onSubmit={handleSend}>
                  <input
                    className="form-input messages-input"
                    placeholder={activeChat.type === 'dm' ? `Message ${currentTitle}...` : 'Message the group...'}
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                  />
                  <button type="submit" className="btn-primary" disabled={!msgText.trim()} style={{ padding: '14px 18px', opacity: msgText.trim() ? 1 : 0.4 }}>
                    <Send size={18} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}