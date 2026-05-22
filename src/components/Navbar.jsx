import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import Logo from './Logo.jsx'
import { 
  Home, 
  Compass, 
  MapPin, 
  Mountain, 
  Zap, 
  TrendingUp, 
  MessageSquare, 
  Bell, 
  Shield, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Plus,
  BookOpen
} from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { notifications, isAdmin, groupChats, messages } = useData() || {}
  const unreadCount = notifications?.filter(n => !n.read).length || 0
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  // Define sidebar navigation items
  const sidebarLinks = [
    { to: '/', label: 'Home', icon: <Home size={20} />, public: true },
    { to: '/feed', label: 'Feed', icon: <Compass size={20} /> },
    { to: '/destinations', label: 'Explore', icon: <MapPin size={20} />, public: true },
    { to: '/missions', label: 'Missions', icon: <Mountain size={20} /> },
    { to: '/test-missions', label: 'Test Missions', icon: <Zap size={20} /> },
    { to: '/fund', label: 'Explorer Fund', icon: <TrendingUp size={20} /> },
    { to: '/bookings', label: 'My Bookings', icon: <BookOpen size={20} /> },
    { to: '/messages', label: 'Chat', icon: <MessageSquare size={20} />, badge: true },
    { to: '/profile', label: 'Notifications', icon: <Bell size={20} />, notifications: true },
    { to: '/admin', label: 'Admin Panel', icon: <Shield size={20} />, adminOnly: true }
  ]

  // Filter links for rendering based on auth status
  const visibleLinks = sidebarLinks.filter(link => {
    if (link.adminOnly) return user && isAdmin
    if (link.public) return true
    return !!user
  })

  // Calculate message badges or notification counts
  const getBadgeCount = (link) => {
    if (link.notifications) return unreadCount
    // For chat, we can just return a simple indicator if there are messages
    if (link.badge) {
      // Find unread count or just a static indicator if messages exist
      const totalMessages = (messages?.length || 0) + (groupChats?.reduce((acc, chat) => acc + (chat.messages?.length || 0), 0) || 0)
      return totalMessages > 0 ? '' : null // return empty string to show a simple dot
    }
    return null
  }

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      {user && (
      <aside className="sidebar-container">
        <div>
          {/* Logo */}
          <Link to="/" className="sidebar-logo">
            <Logo style={{ height: '42px', width: 'auto' }} />
          </Link>

          {/* Navigation Links */}
          <nav className="sidebar-links">
            {visibleLinks.map(link => {
              const badge = getBadgeCount(link)
              const active = isActive(link.to)
              return (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className={`sidebar-link ${active ? 'active' : ''}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    {link.icon}
                    {badge !== null && (
                      <span style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        background: 'var(--accent-gold)',
                        color: '#000',
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        width: badge === '' ? 8 : 16,
                        height: badge === '' ? 8 : 16,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {badge !== '' ? (badge > 9 ? '9+' : badge) : ''}
                      </span>
                    )}
                  </span>
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Primary Action Button */}
          <Link to="/claim" className="btn-primary sidebar-btn">
            <Plus size={16} /> Claim Stay
          </Link>
        </div>

        {/* User Profile / Footer section */}
        <div className="sidebar-footer">
          <Link to="/profile" className="sidebar-profile">
            <div className="sidebar-avatar">
              {user.avatar_url?.startsWith('http') || user.avatar_url?.startsWith('data:') ? (
                <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.avatar_url || user.full_name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.full_name || 'Explorer'}</span>
              <span className="sidebar-user-sub">@{user.username || 'explorer'}</span>
            </div>
          </Link>
          <button onClick={handleLogout} className="sidebar-logout" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      )}

      {/* ================= MOBILE HEADER ================= */}
      <nav className="nav" id="main-nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <Logo style={{ height: '40px', width: 'auto' }} />
          </Link>

          {/* Actions */}
          <div className="nav-actions">
            {user ? (
              <>
                <Link to="/profile" className="nav-link mobile-top-action" title="Notifications" style={{ position: 'relative', display: 'flex', padding: 8 }}>
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 2, right: 2,
                      background: 'var(--accent-gold)', color: '#000',
                      fontSize: '0.55rem', fontWeight: 800,
                      width: 16, height: 16, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/messages" className="nav-link mobile-top-action" title="Messages" style={{ display: 'flex', padding: 8 }}>
                  <MessageSquare size={20} />
                </Link>
                <button className="nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'flex', padding: 8 }}>
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn-primary btn-small">Join Network</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu (Additional Links) */}
      {mobileOpen && (
        <div className="mobile-menu" onClick={() => setMobileOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Network Utilities
            </span>
            {user ? (
              <>
                <Link to="/claim" className="nav-link" onClick={() => setMobileOpen(false)}>
                  Claim Verified Stay
                </Link>
                <Link to="/test-missions" className="nav-link" onClick={() => setMobileOpen(false)}>
                  Test Missions
                </Link>
                <Link to="/fund" className="nav-link" onClick={() => setMobileOpen(false)}>
                  Explorer Fund
                </Link>
                <Link to="/bookings" className="nav-link" onClick={() => setMobileOpen(false)}>
                  My Bookings
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="nav-link" style={{ color: 'var(--accent-gold)' }} onClick={() => setMobileOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}
                <div style={{ height: '1px', width: '120px', background: 'var(--border-subtle)', margin: '8px 0' }} />
                <button onClick={handleLogout} className="nav-link" style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn-primary" onClick={() => setMobileOpen(false)}>
                Join Network
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ================= MOBILE BOTTOM TAB BAR ================= */}
      <div className="bottom-nav">
        <Link to="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        
        {user ? (
          <>
            <Link to="/feed" className={`bottom-nav-item ${isActive('/feed') ? 'active' : ''}`}>
              <Compass size={20} />
              <span>Feed</span>
            </Link>
            
            <Link to="/destinations" className={`bottom-nav-item ${isActive('/destinations') ? 'active' : ''}`}>
              <MapPin size={20} />
              <span>Explore</span>
            </Link>
            
            <Link to="/missions" className={`bottom-nav-item ${isActive('/missions') ? 'active' : ''}`}>
              <Mountain size={20} />
              <span>Missions</span>
            </Link>
            
            <Link to="/profile" className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <User size={20} />
                {unreadCount > 0 && (
                  <span className="bottom-nav-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span>Profile</span>
            </Link>
          </>
        ) : (
          <>
            <Link to="/destinations" className={`bottom-nav-item ${isActive('/destinations') ? 'active' : ''}`}>
              <MapPin size={20} />
              <span>Explore</span>
            </Link>
            
            <Link to="/auth" className={`bottom-nav-item ${isActive('/auth') ? 'active' : ''}`}>
              <User size={20} />
              <span>Join</span>
            </Link>
          </>
        )}
      </div>
    </>
  )
}
