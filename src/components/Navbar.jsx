import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Globe, Menu, X, LogOut, User, MessageSquare, MapPin } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/feed', label: 'Feed' },
    { to: '/destinations', label: 'Destinations' },
    { to: '/missions', label: 'Missions' },
    { to: '/test-missions', label: 'Test Missions' },
    { to: '/fund', label: 'Fund' },
    { to: '/bookings', label: 'Bookings' },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <>
      <nav className="nav" id="main-nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon"><Globe size={20} color="#0a0b0f" /></div>
            <span>World Travelers <span className="text-gradient">Forum</span></span>
          </Link>

          <div className="nav-links">
            {links.map(link => (
              <Link key={link.to} to={link.to} className={`nav-link ${isActive(link.to) ? 'active' : ''}`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <Link to="/messages" className="nav-link" title="Messages">
                  <MessageSquare size={18} />
                </Link>
                <Link to="/claim" className="btn-primary btn-small" style={{ fontSize: '0.8rem' }}>
                  Claim Stay
                </Link>
                <Link to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--gradient-gold)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: '#0a0b0f'
                  }}>
                    {user.avatar}
                  </div>
                </Link>
                <button onClick={handleLogout} className="nav-link" title="Logout">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn-primary btn-small">Join Network — Free</Link>
            )}
            <button className="nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-menu" onClick={() => setMobileOpen(false)}>
          {links.map(link => (
            <Link key={link.to} to={link.to} className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/profile" className="nav-link" onClick={() => setMobileOpen(false)}>
                <User size={18} style={{ marginRight: 8 }} /> Profile
              </Link>
              <Link to="/claim" className="nav-link" onClick={() => setMobileOpen(false)}>
                Claim Verified Stay
              </Link>
              <button onClick={handleLogout} className="nav-link">
                <LogOut size={18} style={{ marginRight: 8 }} /> Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn-primary" onClick={() => setMobileOpen(false)}>
              Join Network — Free
            </Link>
          )}
        </div>
      )}
    </>
  )
}
