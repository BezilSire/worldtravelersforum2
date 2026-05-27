import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/Logo.jsx'
import { 
  ArrowRight, Users, Globe, Plane, Star, Shield, Compass, 
  Mountain, Building2, FileText, ChevronDown, ChevronUp, Check, X, HelpCircle 
} from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

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

  const faqData = [
    {
      q: "Is World Travelers Forum another travel group?",
      a: "No. We are not a travel group trying to organize basic tours or packages for you. We are the digital and financial infrastructure (the ecosystem) built for the groups, clubs, and circles that already exist—like WhatsApp chats, student clubs, local meetup groups, and nomad networks."
    },
    {
      q: "How does the 50% revenue distribution work?",
      a: "Every hotel and flight booking made through our platform generates a commission margin. Unlike corporate booking platforms that keep 100% of these fees, we redirect 50% of all margins back into the Traveler Fund. This fund is owned by the community to finance gatherings, support explorer initiatives, and subsidize test missions."
    },
    {
      q: "How does value capture compare to other booking platforms?",
      a: "When you book a stay on booking portals, your money leaves the ecosystem immediately on check-out to fund corporate dividends and ad campaigns. On the Forum, your bookings actively build equity. 50% of the margin stays with the community, allowing travelers to capture and reuse that value for future travels."
    },
    {
      q: "What is a 'Test Mission'?",
      a: "Test missions are exploratory trips subsidized or fully covered by the Traveler Fund. Active group leaders, trip designers, and community builders can apply to scout new destinations, map local hostels, establish network partners, and design repeatable itineraries for other members."
    },
    {
      q: "What is cheaply.world?",
      a: "cheaply.world is our native booking partner engine integrated directly into the Forum. It provides travelers access to a wholesale database of over 3 million hotels and global flight routes. You get the exact same industry-best inventory, rates, and secure bookings as major platforms, but with a 50% kickback to the community fund."
    },
    {
      q: "Why is this described as 'LinkedIn for Travelers'?",
      a: "Traditional social networks treat travel as empty clout. On World Travelers Forum, travel is your professional reputation. Group leaders establish coordinates, travelers build verified explorer histories (Missions Completed), and creators build portable reputation ranks. It is the network layer that maps real-world coordination, not just aesthetic pictures."
    }
  ]

  return (
    <div className="page">

      {/* ═══════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════ */}
      <section style={{
        minHeight: '85vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden', padding: '60px 0'
      }}>
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,207,180,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', border: '1px solid rgba(212,168,83,0.03)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
            
            {/* Logo */}
            <div className="animate-fade-up" style={{ marginBottom: 24 }}>
              <Logo className="w-48 h-auto" style={{ height: '100px', width: 'auto', margin: '0 auto' }} />
            </div>

            {/* Tag Badge */}
            <div className="animate-fade-up" style={{ marginBottom: 24 }}>
              <span className="badge badge-gold" style={{ fontSize: '0.85rem', padding: '8px 18px', letterSpacing: '0.05em' }}>
                <Globe size={16} style={{ marginRight: 6 }} /> LinkedIn for Travelers — Your Movement, Verified
              </span>
            </div>

            {/* Core Titles */}
            <h1 className="animate-fade-up animate-delay-1" style={{ 
              fontSize: 'clamp(2.4rem, 6.5vw, 4.5rem)', 
              fontWeight: 900, 
              lineHeight: 1.1, 
              marginBottom: 16, 
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-display)'
            }}>
              Every mile is a credential.<br />
              <span className="text-gradient">Every trip funds the next.</span>
            </h1>

            <p className="animate-fade-up animate-delay-2" style={{ 
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', 
              color: 'var(--text-secondary)', 
              maxWidth: 680, 
              margin: '0 auto 28px', 
              lineHeight: 1.7 
            }}>
              The first network where your travel history is your reputation. Built for solo explorers, travel crews, digital nomads, and everyone in between — where every mission, discussion, and booking earns its place.
            </p>

            <p className="animate-fade-up animate-delay-2" style={{ 
              fontSize: '1rem', 
              color: 'var(--text-secondary)', 
              maxWidth: 720, 
              margin: '0 auto 40px', 
              lineHeight: 1.8 
            }}>
              Join or create missions. Dive into <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>destination discussions</span> — see what real travelers say before you land. Book flights and stays through <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>cheaply.world</span> at wholesale rates, with 50% of every margin flowing back to the community. Your movement finally builds something. 
            </p>

            {/* Actions */}
            <div className="animate-fade-up animate-delay-3" style={{ 
              display: 'flex', 
              gap: 16, 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              marginBottom: 48
            }}>
              <Link to="/auth" className="btn-primary" style={{ padding: '14px 28px', fontSize: '0.98rem' }}>
                <Users size={18} /> Join the Forum — It's Free <ArrowRight size={16} />
              </Link>
            </div>

            {/* Key Statistics / Highlights */}
            <div className="animate-fade-up animate-delay-4 home-stat-strip" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 24, 
              marginTop: 56,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              padding: '24px 16px'
            }}>
              {[
                { value: '3M+', label: 'Hotels Worldwide', sub: 'Wholesale rates via cheaply.world' },
                { value: '50%', label: 'Revenue Back to You', sub: 'Community fund, not corporate boards' },
                { value: '0%', label: 'Value Leakage', sub: 'Every booking builds equity' },
                { value: '∞', label: 'Missions & Discussions', sub: 'Join, create, and explore on your terms' },
              ].map((s, i) => (
                <div key={i} style={{ 
                  textAlign: 'center', 
                  padding: '12px 8px',
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                }} className="stat-item">
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.sub}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          COMPARISON SECTION: INCUMBENTS VS THE FORUM
      ═══════════════════════════════════════════════ */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div className="section-header" style={{ maxWidth: 720, margin: '0 auto 56px', textAlign: 'center' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.82rem', padding: '6px 14px', marginBottom: 14 }}>The Old vs The New</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2 }}>
              One model extracts from you.<br />
              <span className="text-gradient">The other builds with you.</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', marginTop: 12 }}>
              The difference between booking a trip and building a legacy. Your movement is either forgotten or recognized.
            </p>
          </div>

          <div className="home-compare-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 32, 
            maxWidth: 960, 
            margin: '0 auto' 
          }}>
            {/* INCUMBENTS CARD */}
            <div className="glass-card" style={{ 
              padding: '36px 28px', 
              borderColor: 'rgba(239, 68, 68, 0.15)',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.02) 0%, rgba(10,11,15,0.8) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(239, 68, 68)' }}>
                  <X size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Incumbent Platforms</h3>
                  <span style={{ fontSize: '0.82rem', color: 'rgb(239,68,68)', fontWeight: 700 }}>The Extraction Economy</span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { title: "Your value disappears at checkout", text: "You pay, you leave, you're forgotten. Your loyalty funds corporate dividends, not your next trip." },
                  { title: "Your history means nothing", text: "Every journey becomes a forgotten photo in an algorithm. No reputation, no recognition, no portable identity." },
                  { title: "Fragmented to death", text: "Chat on WhatsApp, plan on spreadsheets, book on Expedia, post on Instagram. Your travel life is scattered across a dozen silos." },
                  { title: "You feed the machine alone", text: "Solo travelers and small crews have no leverage. Every booking enriches a system that gives nothing back to the people who move through it." }
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ marginTop: 3, color: 'rgba(239,68,68,0.7)', flexShrink: 0 }}><X size={15} /></div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>{item.title}</strong>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* WORLD TRAVELERS FORUM CARD */}
            <div className="glass-card" style={{ 
              padding: '36px 28px', 
              borderColor: 'rgba(62, 207, 180, 0.25)',
              background: 'linear-gradient(135deg, rgba(62,207,180,0.03) 0%, rgba(10,11,15,0.8) 100%)',
              boxShadow: '0 8px 32px rgba(62,207,180,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(62,207,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)' }}>
                  <Check size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>World Travelers Forum</h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--accent-teal)', fontWeight: 700 }}>The Recognition Economy</span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { title: "Your bookings build equity", text: "50% of every commission margin flows to the Traveler Fund — a community-owned pool that sponsors missions, gatherings, and explorers." },
                  { title: "Your history is your reputation", text: "Every mission completed, every discussion contributed, every destination explored builds a verified identity that moves with you." },
                  { title: "Everything in one place", text: "Create missions, join expeditions, explore destination discussions, chat with travelers, and book at wholesale rates — all on a single platform." },
                  { title: "Leverage, not leakage", text: "Solo or in a crew, every booking strengthens the network. You're not feeding a machine — you're building one that belongs to you." }
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ marginTop: 3, color: 'var(--accent-teal)', flexShrink: 0 }}><Check size={15} /></div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>{item.title}</strong>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS: MISSIONS, DISCUSSIONS, REPUTATION
      ═══════════════════════════════════════════════ */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', marginBottom: 56 }}>
            <span className="badge badge-gold" style={{ fontSize: '0.82rem', padding: '6px 14px', marginBottom: 14 }}>For Every Traveler</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', fontWeight: 800, marginBottom: 16 }}>
              Your movement is your<br />
              <span className="text-gradient">identity, reputation, and equity.</span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              World Travelers Forum is the first network that treats every trip as a first-class asset. Whether you fly solo or lead a crew of fifty, your missions, your discussions, and your bookings build a verified explorer profile that moves with you across borders.
              <br /><br />
              <strong>No clout. No algorithms. Just real-world coordination and the recognition you've always deserved.</strong>
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: 24, 
            maxWidth: 960, 
            margin: '0 auto' 
          }} className="home-mission-grid">
            
            {/* CREATE MISSIONS */}
            <div className="glass-card" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', marginBottom: 20 }}>
                <Compass size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Create Missions</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1 }}>
                Design expeditions, set budgets, and invite your crew — or open them to the world. Every mission you launch adds to your reputation as a leader. Apply for Test Mission sponsorship from the Traveler Fund and get your scouting trips subsidized by the community.
              </p>
            </div>

            {/* JOIN MISSIONS */}
            <div className="glass-card" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-teal-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)', marginBottom: 20 }}>
                <Users size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Join Missions</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1 }}>
                Browse active expeditions, cultural meetups, and retreats launched by fellow travelers. Solo? Jump into a mission and connect with people who move the way you do. Every completed mission is stamped on your explorer profile — a verified record of where you've been.
              </p>
            </div>

            {/* DESTINATION DISCUSSIONS */}
            <div className="glass-card" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', marginBottom: 20 }}>
                <Globe size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Destination Discussions</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1 }}>
                Every destination on the network has a discussion thread. See what real travelers are saying, ask about safety, share hidden gems, and coordinate meetups before you even land. No influencers. No paid reviews. Just honest intel from people who've been there.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CHEAPLY.WORLD INTEGRATION
      ═══════════════════════════════════════════════ */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)', background: 'linear-gradient(180deg, transparent 0%, rgba(62,207,180,0.01) 100%)' }}>
        <div className="container">
          <div className="home-cheaply-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.1fr 0.9fr', 
            gap: 40, 
            alignItems: 'center',
            maxWidth: 960, 
            margin: '0 auto' 
          }}>
            <div>
              <span className="badge badge-gold" style={{ fontSize: '0.82rem', padding: '6px 14px', marginBottom: 14 }}>Wholesale Booking Engine</span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
                Book the same rooms.<br />
                <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-teal) 0%, #a7f3d0 100%)' }}>Keep half the margin.</span>
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20 }}>
                We partnered directly with <strong>cheaply.world</strong> to bring wholesale booking rates natively into the Forum. The same inventory as every major platform — flights, hotels, hostels, villas — but with one radical difference: 50% of every commission margin flows back to the Traveler Fund.
              </p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
                Search over 3 million properties and global flight routes across 250 countries. Get the industry's lowest rates with full checkout security. Your booking doesn't just get you a room — it helps send another traveler on their next mission.
              </p>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
                  <Check size={16} /> Same Wholesale Inventory
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
                  <Check size={16} /> 50% Back to the Community
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12, margin: 0 }}>
                Wholesale Inventory
              </h3>
              {[
                { label: "Global Accommodations", count: "3M+ Hotels, Lodges & Villas" },
                { label: "Flight Networks", count: "Global Routes & Carriers" },
                { label: "Country Coverage", count: "250 Countries and Territories" },
                { label: "Wholesale Margin Share", count: "50% Back to the Traveler Fund" }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-gold)' }}>{item.count}</span>
                </div>
              ))}
              <a href="https://cheaply.world" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textAlign: 'center', marginTop: 10, fontSize: '0.88rem', textDecoration: 'none' }}>
                Explore cheaply.world ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          INTERACTIVE FAQ ACCORDION SECTION
      ═══════════════════════════════════════════════ */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div className="section-header" style={{ maxWidth: 720, margin: '0 auto 48px', textAlign: 'center' }}>
            <HelpCircle size={36} style={{ color: 'var(--accent-gold)', marginBottom: 12 }} />
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800 }}>
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 8 }}>
              Everything you need to know about the value-capturing ecosystem.
            </p>
          </div>

          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }} className="faq-accordion">
            {faqData.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div 
                  key={idx} 
                  className="glass-card" 
                  style={{ 
                    padding: '0', 
                    overflow: 'hidden', 
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    borderColor: isOpen ? 'rgba(212,168,83,0.3)' : 'var(--border-subtle)'
                  }}
                  onClick={() => toggleFaq(idx)}
                >
                  {/* Header */}
                  <div style={{ 
                    padding: '20px 24px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    gap: 16,
                    background: isOpen ? 'rgba(255,255,255,0.01)' : 'transparent'
                  }}>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: isOpen ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                      {faq.q}
                    </span>
                    <span style={{ color: isOpen ? 'var(--accent-gold)' : 'var(--text-muted)', flexShrink: 0 }}>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ 
                    maxHeight: isOpen ? '250px' : '0px', 
                    overflow: 'hidden',
                    transition: 'max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderTop: isOpen ? '1px solid var(--border-subtle)' : '1px solid transparent'
                  }}>
                    <p style={{ 
                      padding: '20px 24px', 
                      margin: 0, 
                      fontSize: '0.92rem', 
                      color: 'var(--text-secondary)', 
                      lineHeight: 1.7 
                    }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════ */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
            Your travels have always mattered.
          </h2>
          <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 600, lineHeight: 1.2, marginBottom: 32, color: 'var(--text-secondary)' }}>
            Now they have a <span className="text-gradient">network that proves it.</span>
          </h3>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 40 }}>
            Stop letting algorithms decide what your travel means.<br /><br />
            Join the Forum. Create your explorer profile.<br />
            Launch or join a mission. Book with purpose.<br />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Build the reputation every journey deserves.</span>
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth" className="btn-primary" style={{ padding: '14px 28px' }}><Users size={18} /> Join the Forum — It's Free <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '48px 0 32px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 40 }}>
            <div style={{ maxWidth: 320 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Globe size={20} style={{ color: 'var(--accent-gold)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>World Travelers Forum</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                The network that makes your travel history your reputation. Missions, destination discussions, and community-powered booking — built for every solo explorer, crew, and wanderer in between.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 700 }}>Platform</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[['Missions', '/auth'], ['Test Missions', '/auth'], ['Explorer Fund', '/auth'], ['Destinations', '/destinations']].map(([label, href]) => (
                    <Link key={label} to={href} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = 'var(--accent-gold)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                    >{label}</Link>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 700 }}>Booking</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a href="https://cheaply.world" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.88rem', color: 'var(--accent-teal)', textDecoration: 'none' }}>cheaply.world ↗</a>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>3M+ hotels worldwide</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>250 countries</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 24 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>© 2026 World Travelers Forum. The network belongs to the people inside it.</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link to="/privacy" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                <FileText size={14} /> Privacy
              </Link>
              <Link to="/terms" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                <FileText size={14} /> Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════
          MOBILE RESPONSIVE OVERRIDES
      ═══════════════════════════════════════════════ */}
      <style>{`
        @media (max-width: 768px) {
          .home-compare-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .home-cheaply-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .home-stat-strip {
            grid-template-columns: 1fr 1fr !important;
            gap: 16px !important;
          }
          .stat-item {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            padding-bottom: 16px !important;
          }
          .stat-item:nth-last-child(-n+2) {
            border-bottom: none !important;
            padding-bottom: 0 !important;
          }
        }

        @media (max-width: 480px) {
          .home-stat-strip {
            grid-template-columns: 1fr !important;
          }
          .stat-item {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06) !important;
            padding-bottom: 16px !important;
          }
          .stat-item:last-child {
            border-bottom: none !important;
            padding-bottom: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}