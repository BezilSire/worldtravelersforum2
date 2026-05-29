import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import FlightSearchForm from '../components/FlightSearchForm.jsx'
import FlightResults from '../components/FlightResults.jsx'
import PopularDestinations from '../components/PopularDestinations.jsx'
import { searchCheapTickets } from '../lib/travelpayouts.js'
import { getAirport } from '../data/airports.js'

export default function Bookings() {
  const [flights, setFlights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchParams, setSearchParams] = useState(null)

  const doSearch = useCallback(async (params) => {
    setLoading(true)
    setError('')
    setSearchParams(params)
    try {
      const results = await searchCheapTickets(params)
      setFlights(results)
      if (results.length === 0) {
        setError('No flights found for this route. Try different dates.')
      }
    } catch (err) {
      setError(err.message || 'Search failed. Please try again.')
      setFlights([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSelectDestination = (code, city) => {
    doSearch({ origin: 'JFK', destination: code })
  }

  const showSearch = !flights || flights.length === 0 || error

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
            {searchParams ? (
              <>
                <span style={{ color: 'var(--accent-gold)' }}>{getAirport(searchParams.origin)?.city || searchParams.origin}</span>
                <span style={{ color: 'var(--text-muted)', margin: '0 16px', fontSize: '0.7em' }}>→</span>
                <span style={{ color: '#fff' }}>{getAirport(searchParams.destination)?.city || searchParams.destination}</span>
              </>
            ) : (
              <>
                Book Your Next <br />
                <span style={{ background: 'linear-gradient(to right, var(--accent-gold), #fff)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Flight</span>
              </>
            )}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto', fontWeight: 400 }}>
            {searchParams ? `${flights?.length || 0} flights found` : 'Find the best flight deals for your upcoming missions.'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '-60px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        {/* Search form */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16,
          border: '1px solid var(--border-subtle)', padding: 28,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
          marginBottom: 32,
        }}>
          <FlightSearchForm onSearch={doSearch} loading={loading} />
        </div>

        {/* Results or destinations */}
        {flights && flights.length > 0 && !loading && (
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16,
            border: '1px solid var(--border-subtle)', padding: 28,
            marginBottom: 32,
          }}>
            <FlightResults
              flights={flights}
              loading={false}
              error={error}
              searchParams={searchParams}
              onSearchAgain={() => doSearch(searchParams)}
            />
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button onClick={() => { setFlights(null); setError('') }} className="btn-secondary btn-small">
                <Search size={14} /> New Search
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (!flights || flights.length === 0) && (
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16,
            border: '1px solid var(--border-subtle)', padding: 28,
            marginBottom: 32, textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{error}</p>
            <button onClick={() => { setFlights(null); setError('') }} className="btn-secondary btn-small">
              <Search size={14} /> New Search
            </button>
          </div>
        )}

        {/* Popular Destinations */}
        {!searchParams && (
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16,
            border: '1px solid var(--border-subtle)', padding: 28,
          }}>
            <PopularDestinations onSelectDestination={handleSelectDestination} />
          </div>
        )}
      </div>
    </div>
  )
}
