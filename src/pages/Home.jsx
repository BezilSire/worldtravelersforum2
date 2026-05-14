import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Globe, MapPin, Shield, Users, ArrowRight, Compass, Mountain, Star, FileText } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="page">
      {/* Hero */}
      <section style={{
        minHeight: '90vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Ambient orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,207,180,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', border: '1px solid rgba(212,168,83,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', border: '1px solid rgba(212,168,83,0.06)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <div className="animate-fade-up" style={{ marginBottom: 24 }}>
              <span className="badge badge-gold" style={{ fontSize: '0.8rem', padding: '6px 16px' }}>
                <Globe size={14} /> Global Explorer Network
              </span>
            </div>
            <h1 className="animate-fade-up animate-delay-1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
              Your Movement<br />
              <span className="text-gradient">Matters Here</span>
            </h1>
            <p className="animate-fade-up animate-delay-2" style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Build your explorer identity through verified movement, mission participation and community contribution. Travel isn't just consumption — it's participation.
            </p>
            <div className="animate-fade-up animate-delay-3" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {user ? (
                <>
                  <Link to="/profile" className="btn-primary"><Compass size={18} /> My Explorer Profile <ArrowRight size={16} /></Link>
                  <Link to="/claim" className="btn-secondary"><Shield size={18} /> Claim Verified Stay</Link>
                </>
              ) : (
                <>
                  <Link to="/auth" className="btn-primary"><ArrowRight size={18} /> Join the Network — Free</Link>
                  <Link to="/destinations" className="btn-secondary"><MapPin size={18} /> Explore Destinations</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <h2>How <span className="text-gradient">Movement</span> Becomes Identity</h2>
            <p>Your travel creates value. We make it visible.</p>
          </div>
          <div className="grid-3">
            {[
              { icon: <MapPin size={24} />, title: 'Book Through Cheaply.world', desc: 'Find and book hotels on cheaply.world — a clean, simple booking platform. Your journey starts there.' },
              { icon: <Shield size={24} />, title: 'Claim Your Verified Stay', desc: 'Return here and submit your booking ID to claim your stay. Every verified stay builds your explorer identity.' },
              { icon: <Star size={24} />, title: 'Build Your Explorer Profile', desc: 'Track countries explored, display movement timelines, earn explorer levels and join missions with verified travellers.' },
            ].map((item, i) => (
              <div key={i} className={`glass-card animate-fade-up animate-delay-${i + 1}`} style={{ padding: 36, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--accent-gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--accent-gold)' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: 12 }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Network Stats */}
      <section className="section">
        <div className="container">
          <div className="grid-4">
            {[
              { value: '2,400+', label: 'Verified Stays', color: 'var(--accent-gold)' },
              { value: '89', label: 'Countries Represented', color: 'var(--accent-teal)' },
              { value: '340+', label: 'Active Explorers', color: 'var(--accent-blue)' },
              { value: '24', label: 'Active Missions', color: 'var(--accent-purple)' },
            ].map((stat, i) => (
              <div key={i} className={`stat-card animate-fade-up animate-delay-${i + 1}`}>
                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explorer Levels */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Explorer <span className="text-gradient">Levels</span></h2>
            <p>Progress through the network through verified participation.</p>
          </div>
          <div className="grid-2" style={{ maxWidth: 800, margin: '0 auto' }}>
            {[
              { level: 1, title: 'Newcomer', req: 'Join the network', xp: '0 — 500 XP', color: 'var(--text-secondary)' },
              { level: 2, title: 'Wanderer', req: '3 verified stays', xp: '500 — 1,200 XP', color: 'var(--accent-teal)' },
              { level: 3, title: 'Voyager', req: '5 countries, 1 mission', xp: '1,200 — 2,000 XP', color: 'var(--accent-blue)' },
              { level: 4, title: 'Pathfinder', req: '10 countries, 3 missions', xp: '2,000 — 3,000 XP', color: 'var(--accent-gold)' },
              { level: 5, title: 'Navigator', req: '20 countries, mission leader', xp: '3,000 — 5,000 XP', color: 'var(--accent-purple)' },
              { level: 6, title: 'World Architect', req: '30+ countries, community leader', xp: '5,000+ XP', color: 'var(--accent-rose)' },
            ].map((lvl, i) => (
              <div key={i} className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${lvl.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: lvl.color, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                  {lvl.level}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{lvl.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lvl.req} · {lvl.xp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Missions Preview */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Explorer <span className="text-gradient">Missions</span></h2>
            <p>Coordinate real movement with verified travellers worldwide.</p>
          </div>
          <div className="grid-3">
            {[
              { title: 'East Africa Creator Circuit', type: 'Creator Trip', cities: 'Nairobi → Dar es Salaam → Addis Ababa', spots: '11 spots left' },
              { title: 'SE Asia Nomad Meetup', type: 'Startup Nomad', cities: 'Bangkok → Bali → Ho Chi Minh City', spots: '18 spots left' },
              { title: 'Morocco Photo Expedition', type: 'Photography', cities: 'Marrakech → Fez → Chefchaouen', spots: '7 spots left' },
            ].map((m, i) => (
              <div key={i} className="glass-card" style={{ padding: 28 }}>
                <span className="badge badge-teal" style={{ marginBottom: 16 }}>{m.type}</span>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>{m.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{m.cities}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>{m.spots}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/missions" className="btn-secondary"><Mountain size={18} /> View All Missions <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: 16 }}>Ready to Make Your<br /><span className="text-gradient">Movement Matter?</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>
              Join a global network where travel becomes identity, participation becomes reputation, and movement creates community.
            </p>
            {user ? (
              <Link to="/claim" className="btn-primary"><Shield size={18} /> Claim Your First Stay <ArrowRight size={16} /></Link>
            ) : (
              <Link to="/auth" className="btn-primary"><ArrowRight size={18} /> Join Network — It's Free</Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '40px 0' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Globe size={18} style={{ color: 'var(--accent-gold)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>World Travelers Forum</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Book hotels at <a href="https://cheaply.world" target="_blank" rel="noopener" style={{ color: 'var(--accent-teal)', textDecoration: 'underline' }}>cheaply.world</a> · Build your explorer identity here.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} /> Privacy Policy
            </Link>
            <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} /> Terms & Conditions
            </Link>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2026 World Travelers Forum</div>
        </div>
      </footer>
    </div>
  )
}
