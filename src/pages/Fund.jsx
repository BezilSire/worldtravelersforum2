import { useData } from '../context/DataContext.jsx'
import { Landmark, ArrowRight, Calendar, Globe, Users, Mountain } from 'lucide-react'

export default function Fund() {
  const { fund } = useData()

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--accent-gold)' }}>
            <Landmark size={28} />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: 12 }}>Explorer <span className="text-gradient">Fund</span></h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            A transparent share of network revenue supports missions, gatherings, community initiatives and travel coordination. Every booking through cheaply.world contributes.
          </p>
        </div>

        {/* Fund Overview */}
        <div className="grid-3 animate-fade-up animate-delay-1" style={{ marginBottom: 40 }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>${fund.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Network Revenue (2026)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--accent-teal)' }}>${fund.fundAllocation.toLocaleString()}</div>
            <div className="stat-label">Allocated to Explorer Fund</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{fund.percentAllocated}%</div>
            <div className="stat-label">Of Revenue to Fund</div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="glass-card animate-fade-up animate-delay-2" style={{ padding: 36, marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Globe size={20} style={{ color: 'var(--accent-gold)' }} /> Fund Breakdown
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {fund.breakdown.map((item, i) => {
              const colors = ['var(--accent-gold)', 'var(--accent-teal)', 'var(--accent-purple)', 'var(--accent-blue)']
              const icons = [<Users size={18} key="u" />, <Mountain size={18} key="m" />, <Globe size={18} key="g" />, <Landmark size={18} key="l" />]
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ color: colors[i] }}>{icons[i]}</div>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.category}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.percent}%</span>
                      <span style={{ fontWeight: 700, color: colors[i] }}>${item.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="level-bar-track" style={{ marginBottom: 6 }}>
                    <div className="level-bar-fill" style={{ width: `${item.percent}%`, background: colors[i] }} />
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Allocations */}
        <div className="glass-card animate-fade-up animate-delay-3" style={{ padding: 36, marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={20} style={{ color: 'var(--accent-teal)' }} /> Recent Allocations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {fund.recentAllocations.map((item, i) => (
              <div key={i} style={{ padding: '16px 0', borderBottom: i < fund.recentAllocations.length - 1 ? '1px solid var(--border-subtle)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{item.date}</div>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '1.05rem' }}>${item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency Note */}
        <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            The Explorer Fund is not an investment vehicle, passive income stream or financial return mechanism. It is a transparent allocation of network revenue toward supporting real explorer activity — gatherings, missions, coordination and community initiatives.
          </p>
        </div>
      </div>
    </div>
  )
}
