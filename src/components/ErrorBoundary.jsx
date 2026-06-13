import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error(`ErrorBoundary (${this.props.name || 'unknown'}):`, error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          background: '#000', minHeight: '100vh', color: '#f5f5f7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '40px 24px', fontFamily: 'system-ui, sans-serif'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12, color: '#f97316' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#8e8e93', marginBottom: 12, fontSize: '0.95rem' }}>
              {this.props.name ? `${this.props.name} encountered an error.` : 'This section encountered an error.'}
            </p>
            <p style={{ color: '#48484a', marginBottom: 24, fontSize: '0.8rem', fontFamily: 'monospace', maxWidth: 480, margin: '0 auto 24px', wordBreak: 'break-word' }}>
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button onClick={() => this.props.name === 'Root' ? window.location.reload() : this.setState({ error: null })} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', background: 'linear-gradient(135deg, #f97316, #fb923c)',
              color: '#0a0b0f', fontWeight: 600, fontSize: '0.9rem',
              border: 'none', borderRadius: 12, cursor: 'pointer',
              transition: 'all 0.3s', fontFamily: 'inherit'
            }}>
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
