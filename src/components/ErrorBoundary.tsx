import { Component, type ReactNode, type ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Render del estado de error. `reset` limpia el boundary para reintentar. */
  fallback: (args: { error: Error; reset: () => void }) => ReactNode
  /** Si alguno de estos valores cambia estando en error, el boundary se limpia solo. */
  resetKeys?: unknown[]
  /** Callback opcional al limpiar el error. */
  onReset?: () => void
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Error boundary genérico y reutilizable. React no tiene equivalente en hooks, así que
 * es un class component. El copy visible lo aporta el `fallback` del caller.
 *
 * En el visor lo usamos alrededor del `<Canvas>`: los errores que lanza `useLoader`
 * (dentro de `<Suspense>`, que NO atrapa errores) burbujean hasta acá en vez de tumbar
 * la app con la pantalla por defecto de React Router.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    if (this.state.error && this.props.resetKeys && !shallowEqual(prev.resetKeys, this.props.resetKeys)) {
      this.reset()
    }
  }

  reset = () => {
    this.props.onReset?.()
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return this.props.fallback({ error: this.state.error, reset: this.reset })
    }
    return this.props.children
  }
}

function shallowEqual(a?: unknown[], b?: unknown[]): boolean {
  if (a === b) return true
  if (!a || !b || a.length !== b.length) return false
  return a.every((v, i) => Object.is(v, b[i]))
}
