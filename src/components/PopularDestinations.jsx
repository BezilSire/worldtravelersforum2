import { useState, useEffect } from 'react'
import { Plane, TrendingUp, Loader } from 'lucide-react'
import { searchCheapTickets } from '../lib/travelpayouts.js'
import { getAirport } from '../data/airports.js'

const HUBS = ['JFK', 'LHR', 'CDG', 'DXB', 'SIN', 'NRT', 'SYD', 'GRU']

const DESTINATIONS = [
  { to: 'BCN', name: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80' },
  { to: 'NRT', name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-e94e270b4d82?w=600&q=80' },
  { to: 'CDG', name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
  { to: 'AMS', name: 'Amsterdam', country: 'Netherlands', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80' },
  { to: 'HND', name: 'Tokyo', country: 'Japan', image: '' },
  { to: 'BKK', name: 'Bangkok', country: 'Thailand', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80' },
  { to: 'SIN', name: 'Singapore', country: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80' },
  { to: 'DXB', name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
  { to: 'SYD', name: 'Sydney', country: 'Australia', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80' },
  { to: 'CPT', name: 'Cape Town', country: 'South Africa', image: 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=600&q=80' },
  { to: 'ICN', name: 'Seoul', country: 'South Korea', image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80' },
  { to: 'IST', name: 'Istanbul', country: 'Turkey', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80' },
]

export default function PopularDestinations({ onSelectDestination }) {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchPrices = async () => {
      const result = {}
      for (const hub of HUBS) {
        try {
          const flights = await searchCheapTickets({ origin: hub, destination: '-' })
          if (cancelled) return
          for (const f of flights) {
            const key = f.destination
            if (!result[key] || f.price < result[key]) {
              result[key] = f.price
            }
          }
        } catch {}
      }
      if (!cancelled) {
        setPrices(result)
        setLoading(false)
      }
    }
    fetchPrices()
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 4, height: 24, background: 'var(--accent-gold)', borderRadius: 4 }} />
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Popular Destinations</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Trending routes from around the world</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {DESTINATIONS.map(d => {
          const airport = getAirport(d.to)
          const price = prices[d.to]
          return (
            <button
              key={d.to}
              onClick={() => onSelectDestination(d.to, airport?.city || d.name)}
              style={{
                position: 'relative',
                height: 180,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                padding: 0,
                background: 'var(--bg-elevated)',
                textAlign: 'left',
                color: 'inherit',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
            >
              {d.image && (
                <img src={d.image} alt={d.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <div style={{
                position: 'absolute', inset: 0,
                background: d.image ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)' : 'var(--bg-elevated)',
              }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 2 }}>{airport?.city || d.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>{d.country}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
                  {loading ? (
                    <Loader size={14} className="spin" style={{ color: 'var(--text-muted)' }} />
                  ) : price ? (
                    <><Plane size={14} style={{ color: 'var(--accent-gold)' }} /> from <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>${price}</span></>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Explore</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
