/**
 * ErrorBoundary.jsx
 * -----------------------------------------
 * Class-based React error boundary (required — hooks can't catch
 * render errors) wrapping the whole app to prevent a white-screen
 * crash from any unexpected render error.
 */

import { Component } from 'react';
import Button from '../ui/atoms/Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas p-6 text-center">
          <h1 className="text-2xl font-semibold text-text-primary">Something went wrong</h1>
          <p className="max-w-md text-sm text-text-secondary">
            An unexpected error occurred. Please try reloading the page.
          </p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;