import { useEffect, useRef } from 'react'

export default function Bookings() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current && containerRef.current.children.length === 0) {
      const script = document.createElement('script')
      script.src = "https://tpwdgt.com/content?currency=usd&campaign_id=100&promo_id=7879&plain=true&no_labels=&border_radius=0&color_focused=%23E5F694ff&special=%23C4C4C4&secondary=%23FFFFFF&light=%23FFFFFF&dark=%23262626&color_icons=%23E8F28Cff&color_button=%23E2CA3Dff&primary_override=%23E2CA39ff&searchUrl=www.aviasales.com%2Fsearch&locale=en&powered_by=true&show_hotels=true&shmarker=728203&trs=528643"
      script.async = true
      script.charset = "utf-8"
      containerRef.current.appendChild(script)
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', padding: '120px 20px 60px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 900, 
          textTransform: 'uppercase', 
          marginBottom: '1rem', 
          background: 'var(--gradient-gold)', 
          WebkitBackgroundClip: 'text', 
          color: 'transparent',
          letterSpacing: '-1px'
        }}>
          Book Travel
        </h1>
        <p style={{ color: 'var(--text-secondary, #888)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Find the best flights and hotels for your next global mission. Secure your verified stay directly.
        </p>
      </div>
      
      <div style={{ 
        background: 'var(--bg-card, #111)', 
        borderRadius: '16px', 
        border: '1px solid rgba(255,255,255,0.05)', 
        padding: '24px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        minHeight: '400px'
      }}>
        <div ref={containerRef} style={{ width: '100%' }}></div>
      </div>
    </div>
  )
}
