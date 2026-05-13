import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { Shield, Upload, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react'

export default function ClaimStay() {
  const { user } = useAuth()
  const { submitStay } = useData()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ bookingId: '', bookingEmail: '', hotel: '', city: '', country: '', checkIn: '', checkOut: '', screenshot: null })

  if (!user) return <Navigate to="/auth" />

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.bookingId || !form.bookingEmail || !form.hotel || !form.city || !form.country) return
    submitStay({ ...form, userId: user.id, userName: user.name, userAvatar: user.avatar })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="glass-card animate-fade-up" style={{ padding: 48, maxWidth: 500, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-teal-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={32} style={{ color: 'var(--accent-teal)' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Stay Submitted for Verification</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
            Your stay at <strong>{form.hotel}</strong> in {form.city}, {form.country} has been submitted.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 32 }}>
            Verification typically takes 24–48 hours. Once verified, your explorer profile, movement timeline and participation score will update automatically.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/profile" className="btn-primary"><ArrowRight size={16} /> View Profile</Link>
            <button onClick={() => { setSubmitted(false); setForm({ bookingId: '', bookingEmail: '', hotel: '', city: '', country: '', checkIn: '', checkOut: '', screenshot: null }) }} className="btn-secondary">
              Claim Another Stay
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 640 }}>
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--accent-gold)' }}>
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Claim <span className="text-gradient">Verified Stay</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Booked through <a href="https://cheaply.world" target="_blank" rel="noopener" style={{ color: 'var(--accent-teal)' }}>cheaply.world</a>? Submit your booking details to verify your stay.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card animate-fade-up animate-delay-1" style={{ padding: 36 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ExternalLink size={16} style={{ color: 'var(--accent-teal)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>How it works</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Book your hotel on cheaply.world → Complete your stay → Return here with your Booking ID and email → We verify and update your explorer profile.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Cheaply.world Booking ID *</label>
              <input className="form-input" placeholder="e.g. CHP-28491" value={form.bookingId} onChange={e => setForm({...form, bookingId: e.target.value})} required />
            </div>

            <div className="form-group">
              <label className="form-label">Booking Email *</label>
              <input className="form-input" type="email" placeholder="Email used for booking" value={form.bookingEmail} onChange={e => setForm({...form, bookingEmail: e.target.value})} required />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Hotel Name *</label>
                <input className="form-input" placeholder="Hotel name" value={form.hotel} onChange={e => setForm({...form, hotel: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="form-input" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Country *</label>
              <input className="form-input" placeholder="Country" value={form.country} onChange={e => setForm({...form, country: e.target.value})} required />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Check-in Date</label>
                <input className="form-input" type="date" value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Check-out Date</label>
                <input className="form-input" type="date" value={form.checkOut} onChange={e => setForm({...form, checkOut: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Booking Screenshot (optional)</label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24, border: '2px dashed var(--border-medium)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'border-color 0.3s' }}>
                <Upload size={20} />
                {form.screenshot ? form.screenshot.name : 'Click to upload screenshot'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setForm({...form, screenshot: e.target.files[0]})} />
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              <Shield size={18} /> Submit for Verification <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
