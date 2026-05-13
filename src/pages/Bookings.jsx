import { useEffect, useRef } from 'react'

export default function Bookings() {
  const flightWidgetRef = useRef(null)
  const destinationsWidgetRef = useRef(null)

  useEffect(() => {
    // Flight Search Widget
    if (flightWidgetRef.current && flightWidgetRef.current.children.length === 0) {
      const script = document.createElement('script')
      // Note: show_hotels is set to false here as requested
      script.src = "https://tpwdgt.com/content?currency=usd&campaign_id=100&promo_id=7879&plain=true&no_labels=&border_radius=0&color_focused=%23E5F694ff&special=%23C4C4C4&secondary=%23FFFFFF&light=%23FFFFFF&dark=%23262626&color_icons=%23E8F28Cff&color_button=%23E2CA3Dff&primary_override=%23E2CA39ff&searchUrl=www.aviasales.com%2Fsearch&locale=en&powered_by=true&show_hotels=false&shmarker=728203&trs=528643"
      script.async = true
      script.charset = "utf-8"
      flightWidgetRef.current.appendChild(script)
    }

    // Popular Destinations Widget
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
      paddingBottom: '80px',
      background: '#0a0b0f'
    }}>
      {/* Hero Section with Beautiful Holiday Image */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '65vh',
        minHeight: '450px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // High quality Unsplash tropical beach sunset image
        backgroundImage: 'url("https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, rgba(10,11,15,0.4) 0%, rgba(10,11,15,0.7) 70%, rgba(10,11,15,1) 100%)'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', transform: 'translateY(20px)' }}>
          <span style={{ 
            display: 'inline-block', 
            padding: '6px 16px', 
            background: 'rgba(226, 202, 61, 0.1)', 
            color: '#E2CA3D', 
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            border: '1px solid rgba(226, 202, 61, 0.25)',
            backdropFilter: 'blur(4px)'
          }}>
            Explore the World
          </span>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 6vw, 5.5rem)', 
            fontWeight: 900, 
            textTransform: 'uppercase', 
            marginBottom: '1rem', 
            color: '#ffffff',
            letterSpacing: '-1.5px',
            lineHeight: 1.05
          }}>
            Book Your Next <br/>
            <span style={{ 
              background: 'linear-gradient(to right, #E2CA3D, #FFF)', 
              WebkitBackgroundClip: 'text', 
              color: 'transparent' 
            }}>
              Flight
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', fontWeight: 400, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Find the best flight deals for your upcoming missions. Discover untouched beaches and bustling cityscapes.
          </p>
        </div>
      </div>

      {/* Widgets Container */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '-80px auto 0', 
        padding: '0 20px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Flight Search Widget */}
        <div style={{ 
          background: 'var(--bg-card, #111)', 
          borderRadius: '16px', 
          border: '1px solid rgba(255,255,255,0.1)', 
          padding: '24px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
          marginBottom: '60px',
          backdropFilter: 'blur(10px)'
        }}>
          <div ref={flightWidgetRef} style={{ width: '100%', minHeight: '150px' }}></div>
        </div>

        {/* Popular Destinations Title */}
        <div style={{ marginBottom: '24px', paddingLeft: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '4px', height: '24px', background: '#E2CA3D', borderRadius: '4px' }}></div>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>
              Popular Destinations
            </h2>
            <p style={{ color: '#888', fontSize: '1.05rem', margin: '4px 0 0 0' }}>Get inspired by top locations chosen by other explorers.</p>
          </div>
        </div>

        {/* Popular Destinations Widget */}
        <div style={{ 
          background: 'var(--bg-card, #111)', 
          borderRadius: '16px', 
          border: '1px solid rgba(255,255,255,0.05)', 
          padding: '24px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}>
          <div ref={destinationsWidgetRef} style={{ width: '100%', minHeight: '200px' }}></div>
        </div>
      </div>
    </div>
  )
}
