// frontend/src/components/ErrorBoundary.jsx
import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-dark-400 mb-6 text-sm font-mono">
              {this.state.error?.message}
            </p>
            <Link to="/app" className="btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}