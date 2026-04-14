import React, { Component, ErrorInfo, ReactNode } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

function ErrorFallback({ onReset }: { onReset: () => void }) {
  const t = useTranslations('error')
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-2xl font-semibold">{t('somethingWentWrong')}</p>
      <p className="text-ink-500 max-w-sm text-sm">{t('unexpectedError')}</p>
      <button
        onClick={onReset}
        className="bg-primary-600 hover:bg-primary-700 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
      >
        {t('tryAgain')}
      </button>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary] Caught error:', error)
      console.error('[ErrorBoundary] Component stack:', info.componentStack)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />
    }

    return this.props.children
  }
}
