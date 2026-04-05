import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Capture 10% of transactions for performance monitoring
    tracesSampleRate: 0.1,
    // Capture 10% of sessions for replays (only on errors)
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.01,
    integrations: [Sentry.replayIntegration()],
  })
}
