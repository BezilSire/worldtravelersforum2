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
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px' }}>
          <div>
            <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              {this.props.name ? `${this.props.name} encountered an error.` : 'This section encountered an error.'}
            </p>
            <button className="btn-primary btn-small" onClick={() => this.setState({ error: null })}>
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
