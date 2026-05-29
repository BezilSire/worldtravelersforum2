import { useState, useRef, useEffect } from 'react'
import { Search, ArrowRightLeft, Calendar, Users, MapPin } from 'lucide-react'
import { searchAirports, getAirport } from '../data/airports.js'

export default function FlightSearchForm({ onSearch, loading }) {
  const [origin, setOrigin] = useState('')
  const [dest, setDest] = useState('')
  const [originSuggest, setOriginSuggest] = useState([])
  const [destSuggest, setDestSuggest] = useState([])
  const [originFocus, setOriginFocus] = useState(false)
  const [destFocus, setDestFocus] = useState(false)
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [passengers, setPassengers] = useState(1)
  const originRef = useRef(null)
  const destRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (originRef.current && !originRef.current.contains(e.target)) setOriginFocus(false)
      if (destRef.current && !destRef.current.contains(e.target)) setDestFocus(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const o = getAirport(origin)
    const d = getAirport(dest)
    if (!o || !d) return
    onSearch({
      origin: o.code,
      destination: d.code,
      departDate: departDate || undefined,
      returnDate: returnDate || undefined,
    })
  }

  const swap = () => {
    setOrigin(dest)
    setDest(origin)
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'end' }}>
        <div className="form-group" ref={originRef}>
          <label className="form-label">From</label>
          <div style={{ position: 'relative' }}>
            <MapPin size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)', zIndex: 1 }} />
            <input
              className="form-input"
              style={{ paddingLeft: 38 }}
              placeholder="City or airport"
              value={origin}
              onChange={e => { setOrigin(e.target.value.toUpperCase()); setOriginSuggest(searchAirports(e.target.value)) }}
              onFocus={() => setOriginFocus(true)}
              required
            />
            {originFocus && originSuggest.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', zIndex: 50, marginTop: 4, maxHeight: 240, overflowY: 'auto', boxShadow: 'var(--shadow-md)' }}>
                {originSuggest.map(a => (
                  <button type="button" key={a.code} onClick={() => { setOrigin(a.code); setOriginSuggest([]); setOriginFocus(false) }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.9rem' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)', minWidth: 40 }}>{a.code}</span>
                    <div>
                      <div>{a.city}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button type="button" onClick={swap} style={{ padding: 10, borderRadius: '50%', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
          <ArrowRightLeft size={16} />
        </button>

        <div className="form-group" ref={destRef}>
          <label className="form-label">To</label>
          <div style={{ position: 'relative' }}>
            <MapPin size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)', zIndex: 1 }} />
            <input
              className="form-input"
              style={{ paddingLeft: 38 }}
              placeholder="City or airport"
              value={dest}
              onChange={e => { setDest(e.target.value.toUpperCase()); setDestSuggest(searchAirports(e.target.value)) }}
              onFocus={() => setDestFocus(true)}
              required
            />
            {destFocus && destSuggest.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', zIndex: 50, marginTop: 4, maxHeight: 240, overflowY: 'auto', boxShadow: 'var(--shadow-md)' }}>
                {destSuggest.map(a => (
                  <button type="button" key={a.code} onClick={() => { setDest(a.code); setDestSuggest([]); setDestFocus(false) }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.9rem' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)', minWidth: 40 }}>{a.code}</span>
                    <div>
                      <div>{a.city}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Depart</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)', zIndex: 1 }} />
            <input className="form-input" style={{ paddingLeft: 38 }} type="date" value={departDate} min={minDate} onChange={e => setDepartDate(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Return</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)', zIndex: 1 }} />
            <input className="form-input" style={{ paddingLeft: 38 }} type="date" value={returnDate} min={departDate || minDate} onChange={e => setReturnDate(e.target.value)} />
          </div>
        </div>
        <div className="form-group" style={{ maxWidth: 100 }}>
          <label className="form-label">Passengers</label>
          <div style={{ position: 'relative' }}>
            <Users size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)', zIndex: 1 }} />
            <input className="form-input" style={{ paddingLeft: 38 }} type="number" min={1} max={9} value={passengers} onChange={e => setPassengers(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '16px 32px', fontSize: '1rem' }}>
        {loading ? 'Searching...' : <><Search size={18} /> Search Flights</>}
      </button>
    </form>
  )
}
