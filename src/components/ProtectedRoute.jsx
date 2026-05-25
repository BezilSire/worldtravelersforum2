import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page" style={{ pointerEvents: 'none' }}>
        <div className="container" style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ height: 48, width: '40%', background: 'var(--bg-elevated)', borderRadius: 12, marginBottom: 32, animation: 'pulse-glow 2s infinite' }} />
          {[1, 2, 3].map(i => (
            <div key={i} style={{ padding: '24px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-elevated)', animation: 'pulse-glow 2s infinite', animationDelay: `${i * 0.2}s` }} />
                <div style={{ height: 14, width: 120, background: 'var(--bg-elevated)', borderRadius: 6, animation: 'pulse-glow 2s infinite', animationDelay: `${i * 0.2}s` }} />
              </div>
              <div style={{ height: 14, width: '70%', background: 'var(--bg-elevated)', borderRadius: 6, marginBottom: 8, animation: 'pulse-glow 2s infinite', animationDelay: `${i * 0.2}s` }} />
              <div style={{ height: 14, width: '45%', background: 'var(--bg-elevated)', borderRadius: 6, animation: 'pulse-glow 2s infinite', animationDelay: `${i * 0.2}s` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth but keep the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
