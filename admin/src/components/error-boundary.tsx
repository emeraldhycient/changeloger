import { Component, type ReactNode } from "react"

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })} className="mt-4 rounded bg-primary px-4 py-2 text-sm text-primary-foreground">
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
