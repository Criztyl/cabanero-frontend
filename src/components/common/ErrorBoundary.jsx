import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ padding:'40px', textAlign:'center', color:'var(--text-muted)' }}>
        <p style={{ fontSize:'24px', marginBottom:'12px' }}>⚠️</p>
        <p style={{ fontWeight:600, color:'#fff' }}>Something went wrong</p>
        <p style={{ fontSize:'13px', marginTop:'8px' }}>{this.state.error?.message}</p>
        <button onClick={() => this.setState({ hasError:false })}
          style={{ marginTop:'20px', padding:'8px 20px', background:'var(--primary-color)',
                   border:'none', borderRadius:'8px', color:'#fff', cursor:'pointer' }}>
          Try Again
        </button>
      </div>
    );
  }
}