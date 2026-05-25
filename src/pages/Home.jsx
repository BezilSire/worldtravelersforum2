import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ArrowRight, Users, Globe, Plane, Star, Shield, Compass, Mountain, Building2, FileText } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="page" style={{ opacity: 0.5, pointerEvents: 'none' }}>
        <div className="container">
          <div style={{ height: '400px', background: 'var(--bg-elevated)', borderRadius: '24px', animation: 'pulse-glow 2s infinite' }}></div>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/feed" replace />
  }

  return (
    <div className="page">

      {/* ===== HERO ===== */}
      <section style={{
        minHeight: '90vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,207,180,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', border: '1px solid rgba(212,168,83,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', border: '1px solid rgba(212,168,83,0.06)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <div className="animate-fade-up" style={{ marginBottom: 24 }}>
              <span className="badge badge-gold" style={{ fontSize: '0.8rem', padding: '6px 16px' }}>
                <Globe size={14} /> The Travel Community Platform
              </span>
            </div>
            <h1 className="animate-fade-up animate-delay-1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 12, letterSpacing: '-0.02em' }}>
              Travel together.
            </h1>
            <h2 className="animate-fade-up animate-delay-1" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: 24, color: 'var(--text-secondary)' }}>
              Build what travel <span className="text-gradient">should have been.</span>
            </h2>
            <p className="animate-fade-up animate-delay-2" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
              The world's first platform built for travel communities.
            </p>
            <p className="animate-fade-up animate-delay-2" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Book flights and hotels. Organise missions. Bring your travel group. Help shape a global network where every booking strengthens future experiences for the people inside it.
            </p>
            <div className="animate-fade-up animate-delay-3" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/auth" className="btn-primary"><Users size={18} /> Join the Forum <ArrowRight size={16} /></Link>
              <Link to="/destinations" className="btn-secondary"><Building2 size={18} /> Bring Your Group</Link>
            </div>
            <div className="animate-fade-up animate-delay-4" style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', marginTop: 48 }}>
              {[
                { value: '3M+', label: 'Hotels Worldwide' },
                { value: '250', label: 'Countries Covered' },
                { value: '—', label: 'Flights Fully Integrated' },
                { value: '—', label: 'Community-Powered Missions' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== BUILT ON TRAVELERS ===== */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
              The travel industry was built on travelers.
            </h2>
            <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 600, lineHeight: 1.2, marginBottom: 32, color: 'var(--text-secondary)' }}>
              But <span className="text-gradient">never built for them.</span>
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 32 }}>
              The biggest travel companies in the world grew from your movement.<br /><br />
              Your recommendations.<br />
              Your reviews.<br />
              Your group chats.<br />
              Your loyalty.<br />
              Your communities.<br /><br />
              They turned traveler activity into billion-dollar platforms.<br /><br />
              World Travelers Forum is building something different.<br /><br />
              Not another booking site.<br />
              Not another social network.<br /><br />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>An operating system for modern travel communities.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ===== HOME FOR EVERY GROUP ===== */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <h2>A home for <span className="text-gradient">every travel group.</span></h2>
          </div>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.8, textAlign: 'center', marginBottom: 40 }}>
              Whether you're:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {[
                'running a backpacking community,',
                'organising group trips,',
                'leading a digital nomad circle,',
                'building a student travel network,',
                'planning adventures with friends,',
                'or creating a travel movement from scratch —',
              ].map((text, i) => (
                <div key={i} className="glass-card" style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-gold)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.95rem' }}>{text}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '1.05rem', fontWeight: 600, textAlign: 'center', color: 'var(--accent-teal)' }}>
              World Travelers Forum gives your community a place to live, coordinate, travel, and grow.
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: 8 }}>
              Keep your culture. Use our infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* ===== ONE PLATFORM ===== */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <h2>One platform.</h2>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Infinite <span className="text-gradient">journeys.</span></h3>
          </div>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { num: '01', label: 'Bring your people', desc: 'Already have a WhatsApp, Telegram, Facebook, or Discord travel group? Bring it here. Build your own space inside the network.', icon: <Users size={22} /> },
              { num: '02', label: 'Travel normally', desc: 'Book flights and hotels across 250 countries using the same global inventory travelers already use every day.', icon: <Plane size={22} /> },
              { num: '03', label: 'Launch Missions', desc: 'Create gatherings, expeditions, meetups, retreats, cultural journeys, test missions, and coordinated adventures with your community.', icon: <Mountain size={22} /> },
              { num: '04', label: 'Strengthen the network', desc: 'Every booking made through the platform contributes to the Traveler Fund — helping power future missions, gatherings, and community-led experiences across the ecosystem.', icon: <Shield size={22} /> },
              { num: '05', label: 'Shape what comes next', desc: 'The platform evolves with the people inside it. New missions. New tools. New communities. Built together.', icon: <Star size={22} /> },
            ].map((step, i) => (
              <div key={i} className={`glass-card animate-fade-up animate-delay-${i + 1}`} style={{ padding: 28, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', flexShrink: 0 }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{step.num}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 6 }}>{step.label}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NOT ANOTHER TRAVEL GROUP ===== */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
              Not another travel group.
            </h2>
            <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 600, lineHeight: 1.2, marginBottom: 32, color: 'var(--text-secondary)' }}>
              The layer <span className="text-gradient">beneath them all.</span>
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20 }}>
              LinkedIn didn't replace work.<br />
              It became the infrastructure around it.<br /><br />
              World Travelers Forum is building that layer for travel.<br /><br />
              A place where travel communities:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
              {['organise,', 'coordinate,', 'discover,', 'book,', 'and build experiences together.'].map((word, i) => (
                <span key={i} className="badge badge-gold" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>{word}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRAVELER FUND ===== */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
              The <span className="text-gradient">Traveler Fund</span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 32 }}>
              50% of platform revenue flows back into the ecosystem through the Traveler Fund.
            </p>
            <div className="glass-card" style={{ padding: 32, textAlign: 'left' }}>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Funding:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  'community missions,',
                  'travel experiments,',
                  'gatherings,',
                  'hosted experiences,',
                  'exploration projects,',
                  'and network-led adventures.',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-teal)', flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--accent-teal)', marginTop: 20, fontWeight: 600 }}>
                The more the network moves, the more becomes possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BUILT FOR ===== */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Built for the people who<br /><span className="text-gradient">move the world.</span></h2>
          </div>
          <div className="grid-2" style={{ maxWidth: 800, margin: '0 auto' }}>
            {[
              { title: 'Group Leaders', desc: 'Bring your community onto infrastructure designed for modern travel coordination.', icon: <Users size={24} /> },
              { title: 'Travelers', desc: 'Discover communities, missions, and experiences beyond ordinary booking platforms.', icon: <Compass size={24} /> },
              { title: 'Mission Creators', desc: 'Turn ideas into organised journeys people can rally around.', icon: <Mountain size={24} /> },
              { title: 'Hosts & Contributors', desc: 'Help shape the culture, energy, and direction of the network.', icon: <Star size={24} /> },
            ].map((role, i) => (
              <div key={i} className={`glass-card animate-fade-up animate-delay-${i + 1}`} style={{ padding: 28 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-teal-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)', marginBottom: 16 }}>
                  {role.icon}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>{role.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <h2>The world is already <span className="text-gradient">waiting.</span></h2>
          </div>
          <div className="grid-4">
            {[
              { value: '3M+', label: 'Hotels & Accommodations', sub: 'From hostels and capsule hotels to villas and safari lodges.' },
              { value: '—', label: 'Flights Integrated', sub: 'Search and book flights without leaving the platform.' },
              { value: '250', label: 'Countries Covered', sub: 'A global network with no borders.' },
              { value: '—', label: 'Community-Led Travel', sub: 'Travel shaped by people — not algorithms alone.' },
            ].map((s, i) => (
              <div key={i} className={`stat-card animate-fade-up animate-delay-${i + 1}`}>
                <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>{s.value}</div>
                <div className="stat-label" style={{ fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
            The future of travel
          </h2>
          <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 600, lineHeight: 1.2, marginBottom: 32, color: 'var(--text-secondary)' }}>
            won't be built by <span className="text-gradient">corporations alone.</span>
          </h3>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 40 }}>
            It will be built by travelers organising together.<br /><br />
            Join World Travelers Forum.<br />
            Bring your people.<br />
            Launch missions.<br />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Help build the network travel always deserved.</span>
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth" className="btn-primary"><Users size={18} /> Join the Forum — It's Free <ArrowRight size={16} /></Link>
            <Link to="/destinations" className="btn-secondary"><Building2 size={18} /> Bring My Travel Group</Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
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