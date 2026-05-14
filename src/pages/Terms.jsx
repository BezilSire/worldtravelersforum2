import { Link } from 'react-router-dom'
import { FileText, ArrowLeft } from 'lucide-react'

export default function Terms() {
  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 800 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 32 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="glass-card" style={{ padding: '48px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <FileText size={24} style={{ color: 'var(--accent-gold)' }} />
            <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Terms & Conditions</h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            <p><strong>Last updated:</strong> May 2026</p>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>1. Acceptance of Terms</h2>
              <p>By creating an account and using World Travelers Forum, you agree to these Terms & Conditions. If you do not agree, please do not use the platform.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>2. User Accounts</h2>
              <p>You are responsible for maintaining the accuracy of your profile information and for all activity under your account. You must not create misleading profiles or impersonate others. One account per person is permitted.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>3. Verified Stays</h2>
              <p>Verified stays are based on bookings made through cheaply.world. Fraudulent claims or attempts to falsify travel history may result in account suspension or permanent ban.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>4. Community Conduct</h2>
              <p>Users are expected to treat fellow explorers with respect. Harassment, hate speech, spam, or any disruptive behavior is prohibited. We reserve the right to remove content and suspend accounts that violate these standards.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>5. Intellectual Property</h2>
              <p>Your profile content (bio, photos, social links) remains your property. By posting on the platform, you grant World Travelers Forum a non-exclusive license to display this content within the service. The platform name, logo, and design are our intellectual property.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>6. Limitation of Liability</h2>
              <p>World Travelers Forum is provided as a community platform. We are not responsible for interactions between users, third-party services (including cheaply.world), or any damages arising from use of the platform.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>7. Changes to Terms</h2>
              <p>We reserve the right to update these terms at any time. Users will be notified of material changes via email or platform notice. Continued use after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>8. Contact</h2>
              <p>For questions about these terms, contact <a href="mailto:support@worldtravelers.forum" style={{ color: 'var(--accent-gold)' }}>support@worldtravelers.forum</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
