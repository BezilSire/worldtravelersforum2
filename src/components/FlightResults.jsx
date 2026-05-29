import { Plane, ArrowRight, Clock, AlertCircle } from 'lucide-react'
import { getAirport } from '../data/airports.js'

function formatDuration(mins) {
  if (!mins) return ''
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

function formatTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function FlightResults({ flights, loading, error, searchParams, onSearchAgain }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ padding: 20, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', opacity: 0.5 }}>
            <div style={{ height: 20, width: '60%', background: 'var(--border-subtle)', borderRadius: 4, marginBottom: 12 }} />
            <div style={{ height: 14, width: '40%', background: 'var(--border-subtle)', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 14, width: '30%', background: 'var(--border-subtle)', borderRadius: 4 }} />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
        <AlertCircle size={40} style={{ color: '#f87171', marginBottom: 16 }} />
        <p style={{ fontSize: '1rem', marginBottom: 8 }}>Failed to load flights</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>{error}</p>
        <button onClick={onSearchAgain} className="btn-secondary btn-small">Try Again</button>
      </div>
    )
  }

  if (!flights || flights.length === 0) {
    return null
  }

  const originA = getAirport(searchParams?.origin)
  const destA = getAirport(searchParams?.destination)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--accent-gold)' }}>{originA?.city || searchParams?.origin}</span>
            <Plane size={16} style={{ color: 'var(--text-muted)' }} />
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--accent-gold)' }}>{destA?.city || searchParams?.destination}</span>
          </h3>
          {searchParams?.departDate && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {formatDate(searchParams.departDate)}{searchParams.returnDate ? ` — ${formatDate(searchParams.returnDate)}` : ''}
            </p>
          )}
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{flights.length} flights found</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {flights.map((f, i) => {
          const carrier = getAirport(f.destination)
          return (
            <div key={i} style={{
              padding: '16px 20px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Plane size={18} style={{ color: 'var(--accent-gold)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {originA?.code || f.origin} → {carrier?.code || f.destination}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {f.airline && <span>{f.airline}</span>}
                      {f.duration && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {formatDuration(f.duration)}</span>}
                      <span>{f.transfers === 0 ? 'Direct' : `${f.transfers} stop${f.transfers > 1 ? 's' : ''}`}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    ${f.price}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    {f.departureAt && formatTime(f.departureAt)}
                  </div>
                  <a
                    href={`https://www.aviasales.com${f.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ padding: '6px 16px', fontSize: '0.75rem', display: 'inline-flex' }}
                  >
                    View Deal <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
