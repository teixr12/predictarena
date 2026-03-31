import * as admin from 'firebase-admin'
import { getLocalEnv, initAdmin } from 'shared/init-admin'
import { loadSecretsToEnv, getServiceAccountCredentials } from 'common/secrets'
import { LOCAL_DEV, log } from 'shared/utils'
import { METRIC_WRITER } from 'shared/monitoring/metric-writer'
import { initCaches } from 'shared/init-caches'
import { listen as webSocketListen } from 'shared/websockets/server'

log('Api server starting up...')

if (process.env.GOOGLE_CLOUD_PROJECT) {
  // Running on GCP — use implicit credentials
  const projectId = process.env.GOOGLE_CLOUD_PROJECT
  admin.initializeApp({
    projectId,
    storageBucket: `${projectId}.appspot.com`,
  })
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Running on non-GCP platform (Render, etc.) with explicit service account
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  admin.initializeApp({
    projectId: sa.project_id,
    credential: admin.credential.cert(sa),
    storageBucket: `${sa.project_id}.appspot.com`,
  })
} else {
  // Local development
  initAdmin()
}

METRIC_WRITER.start()

// Prevent pg-promise background connection failures from crashing the process
process.on('unhandledRejection', (reason: any) => {
  log.error('Unhandled promise rejection (non-fatal):', { reason })
})

import { app } from './app'

const credentials = LOCAL_DEV
  ? getServiceAccountCredentials(getLocalEnv())
  : // No explicit credentials needed for deployed service.
    undefined

const DB_RESPONSE_TIMEOUT = 30_000

const startupProcess = async () => {
  await loadSecretsToEnv(credentials)
  log('Secrets loaded.')

  // Start HTTP server first so Render health checks pass even if DB is unavailable
  const PORT = process.env.PORT ?? 8088
  const httpServer = app.listen(PORT, () => {
    log.info(`Serving API on port ${PORT}.`)
  })

  if (!process.env.READ_ONLY) {
    webSocketListen(httpServer, '/ws')
    log.info('Web socket server listening on /ws')
  }

  log('Server started successfully')

  // Initialize DB caches in the background — DB-dependent endpoints will
  // return errors until this completes, but the server stays alive.
  log('Starting server <> postgres timeout')
  const timeoutId = setTimeout(() => {
    log.error(
      `Server hasn't heard from postgres in ${DB_RESPONSE_TIMEOUT}ms. DB caches not loaded.`
    )
  }, DB_RESPONSE_TIMEOUT)

  try {
    await initCaches(timeoutId)
    log('Caches loaded.')
  } catch (err) {
    clearTimeout(timeoutId)
    log.error('Failed to initialize caches; DB-dependent endpoints may fail.', {
      err,
    })
  }
}
startupProcess()
