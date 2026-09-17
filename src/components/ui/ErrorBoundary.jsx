import { Component } from 'react'
import { Button } from './Button.jsx'
import './ErrorBoundary.css'

/**
 * The only place in the app that catches a thrown error and shows a real
 * "something went wrong" state instead of an unmounted blank screen — a
 * required UI state (section 42: "Generation: generating, generated,
 * generation error") that nothing upstream provided until now. React error
 * boundaries must be class components; there is no hook equivalent.
 */
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="ff-error-boundary">
          <p className="ff-error-boundary__title">{this.props.title ?? 'Something went wrong'}</p>
          <p className="ff-error-boundary__message">{this.state.error.message}</p>
          <Button variant="secondary" size="sm" onClick={() => this.setState({ error: null })}>
            Try again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
