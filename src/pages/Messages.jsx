import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Send, User, Search, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'

export default function Messages() {
  const { user } = useAuth()
  const { messages, sendMessage, groupChats, sendGroupMessage } = useData()
  const [msgText, setMsgText] = useState('')
  const [activeChat, setActiveChat] = useState({ type: 'dm', id: 'alex' })

  if (!user) return <Navigate to="/auth" />

  const userMessages = messages.filter(m => m.to === user.full_name || m.from === user.full_name)
  const userGroups = groupChats.filter(gc => gc.participants.includes(user.id))

  const handleSend = (e) => {
    e.preventDefault()
    if (!msgText.trim()) return
    
    if (activeChat.type === 'dm') {
      sendMessage({
        from: user.full_name,
        to: activeChat.id === 'alex' ? 'Alex Chen' : '', 
        text: msgText,
      })
    } else {
      sendGroupMessage(activeChat.id, {
        from: user.full_name,
        text: msgText,
      })
    }
    setMsgText('')
  }

  const currentMessages = activeChat.type === 'dm' 
    ? userMessages 
    : (groupChats.find(gc => gc.id === activeChat.id)?.messages || [])

  const currentTitle = activeChat.type === 'dm'
    ? (activeChat.id === 'alex' ? 'Alex Chen' : 'Direct Message')
    : (groupChats.find(gc => gc.id === activeChat.id)?.title || 'Mission Chat')

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 900 }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: 32 }}>Explorer <span className="text-gradient">Messages</span></h1>
        
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 600, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{ borderRight: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ padding: 20 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" placeholder="Search explorers..." style={{ width: '100%', paddingLeft: 36, fontSize: '0.85rem' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '8px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Direct Messages</div>
              <div 
                onClick={() => setActiveChat({ type: 'dm', id: 'alex' })}
                style={{ 
                  padding: '16px 20px', 
                  background: activeChat.type === 'dm' ? 'var(--accent-gold-glow)' : 'transparent',
                  borderLeft: activeChat.id === 'alex' ? '3px solid var(--accent-gold)' : '3px solid transparent',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' 
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="var(--accent-gold)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Alex Chen</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Online</div>
                </div>
              </div>

              {userGroups.length > 0 && (
                <>
                  <div style={{ padding: '16px 20px 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mission Groups</div>
                  {userGroups.map(group => (
                    <div 
                      key={group.id}
                      onClick={() => setActiveChat({ type: 'group', id: group.id })}
                      style={{ 
                        padding: '16px 20px', 
                        background: activeChat.id === group.id ? 'var(--accent-teal-glow)' : 'transparent',
                        borderLeft: activeChat.id === group.id ? '3px solid var(--accent-teal)' : '3px solid transparent',
                        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' 
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageSquare size={20} color="var(--accent-teal)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{group.participants.length} members</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <h3 style={{ fontSize: '1rem' }}>{currentTitle}</h3>
              {activeChat.type === 'dm' && <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>Verified Explorer</span>}
            </div>

            <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
              {currentMessages.map((m, i) => (
                <div key={i} style={{ 
                  alignSelf: m.from === user.full_name ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: 16,
                  background: m.from === user.name ? (activeChat.type === 'dm' ? 'var(--accent-gold-glow)' : 'var(--accent-teal-glow)') : 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.9rem'
                }}>
                  {activeChat.type === 'group' && m.from !== user.full_name && (
                    <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--accent-teal)', marginBottom: 4 }}>{m.from}</div>
                  )}
                  {m.text}
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: 24, borderTop: '1px solid var(--border-subtle)' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: 12 }}>
                <input 
                  className="form-input" 
                  placeholder={activeChat.type === 'dm' ? `Message ${currentTitle}...` : `Message the group...`}
                  style={{ flex: 1 }}
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
