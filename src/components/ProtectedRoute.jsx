import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a skeleton structure so it's not a "dark screen"
    return (
      <div className="page" style={{ opacity: 0.5, pointerEvents: 'none' }}>
        <div className="container">
          <div style={{ height: '400px', background: 'var(--bg-elevated)', borderRadius: '24px', animation: 'pulse-glow 2s infinite' }}></div>
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
