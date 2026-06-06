import { useEffect, useRef } from 'react'

export default function Bookings() {
  const flightWidgetRef = useRef(null)
  const destinationsWidgetRef = useRef(null)

  useEffect(() => {
    if (flightWidgetRef.current && flightWidgetRef.current.children.length === 0) {
      const script = document.createElement('script')
      script.src = "https://tpwdgt.com/content?currency=usd&campaign_id=100&promo_id=7879&plain=true&no_labels=&border_radius=0&color_focused=%23E5F694ff&special=%23C4C4C4&secondary=%23FFFFFF&light=%23FFFFFF&dark=%23262626&color_icons=%23E8F28Cff&color_button=%23E2CA3Dff&primary_override=%23E2CA39ff&searchUrl=www.aviasales.com%2Fsearch&locale=en&powered_by=true&show_hotels=false&shmarker=728203&trs=528643"
      script.async = true
      script.charset = "utf-8"
      flightWidgetRef.current.appendChild(script)
    }

    if (destinationsWidgetRef.current && destinationsWidgetRef.current.children.length === 0) {
      const script2 = document.createElement('script')
      script2.src = "https://tpwdgt.com/content?currency=usd&campaign_id=100&promo_id=4044&primary=%23B4830Dff&powered_by=true&limit=7&locale=en&target_host=www.aviasales.com%2Fsearch&shmarker=728203&trs=528643"
      script2.async = true
      script2.charset = "utf-8"
      destinationsWidgetRef.current.appendChild(script2)
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: 80,
      background: 'var(--bg-main)',
    }}>
      {/* Hero */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '55vh',
        minHeight: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,11,15,0.4) 0%, rgba(10,11,15,0.7) 70%, rgba(10,11,15,1) 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', transform: 'translateY(-20px)' }}>
          <span style={{
            display: 'inline-block', padding: '6px 16px',
            background: 'rgba(249,115,22,0.1)', color: 'var(--accent-gold)',
            borderRadius: 30, fontSize: '0.85rem', fontWeight: 700,
            marginBottom: '1.5rem', letterSpacing: '1.5px', textTransform: 'uppercase',
            border: '1px solid rgba(249,115,22,0.25)', backdropFilter: 'blur(4px)',
          }}>
            Explore the World
          </span>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900,
            textTransform: 'uppercase', marginBottom: '0.75rem',
            letterSpacing: '-1.5px', lineHeight: 1.05,
          }}>
            Book Your Next <br />
            <span style={{ background: 'linear-gradient(to right, var(--accent-gold), #fff)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Flight</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto', fontWeight: 400 }}>
            Find the best flight deals for your upcoming missions.
          </p>
        </div>
      </div>

      {/* Widgets */}
      <div style={{ maxWidth: 1000, margin: '-60px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        {/* Flight Search Widget */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16,
          border: '1px solid var(--border-subtle)', padding: 28,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
          marginBottom: 60,
        }}>
          <div ref={flightWidgetRef} style={{ width: '100%', minHeight: 150 }}></div>
        </div>

        {/* Popular Destinations */}
        <div style={{ marginBottom: 24, paddingLeft: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 4, height: 24, background: 'var(--accent-gold)', borderRadius: 4 }}></div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>
              Popular Destinations
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '4px 0 0 0' }}>
              Get inspired by top locations chosen by other explorers.
            </p>
          </div>
        </div>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16,
          border: '1px solid var(--border-subtle)', padding: 28,
          overflow: 'hidden',
        }}>
          <div ref={destinationsWidgetRef} style={{ width: '100%', minHeight: 200 }}></div>
        </div>
      </div>
    </div>
  )
}
