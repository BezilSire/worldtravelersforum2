import { Link } from 'react-router-dom'
import { Globe, ArrowLeft } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 800 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 32 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="glass-card" style={{ padding: '48px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <Globe size={24} style={{ color: 'var(--accent-gold)' }} />
            <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Privacy Policy</h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            <p><strong>Last updated:</strong> May 2026</p>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>1. Information We Collect</h2>
              <p>When you create an account on World Travelers Forum, we collect your name, email address, and profile information (including avatar, bio, and social media links). We also collect data about your verified stays, travel history, mission participation, and other interactions within the platform.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>2. How We Use Your Information</h2>
              <p>We use your information to provide and improve our services, verify your travel stays, display your explorer profile to other users, facilitate community features (missions, discussions, messaging), and communicate with you about your account and platform updates.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>3. Data Sharing</h2>
              <p>We do not sell your personal information. Information you choose to share on your public explorer profile is visible to other authenticated users of the platform. We may share data with service providers who help us operate (e.g., hosting, authentication) under strict confidentiality agreements.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>4. Data Security</h2>
              <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest. However, no method of electronic storage is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>5. Your Rights</h2>
              <p>You may access, update, or delete your account information at any time through your profile settings. You can request full deletion of your account and associated data by contacting our support team.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>6. Contact</h2>
              <p>For privacy-related inquiries, contact us at <a href="mailto:support@worldtravelers.forum" style={{ color: 'var(--accent-gold)' }}>support@worldtravelers.forum</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
