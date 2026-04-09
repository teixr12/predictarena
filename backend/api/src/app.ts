import { API, type APIPath } from 'common/api/schema'
import { APIError, pathWithPrefix } from 'common/api/utils'
import { randomString } from 'common/util/random'
import { assertUnreachable } from 'common/util/types'
import * as compression from 'compression'
import * as cors from 'cors'
import * as express from 'express'
import { ErrorRequestHandler, RequestHandler } from 'express'
import { hrtime } from 'node:process'
import { withMonitoringContext } from 'shared/monitoring/context'
import { log, metrics } from 'shared/utils'
import { typedEndpoint } from './helpers/endpoint'
import { handleMcpRequest } from './mcp'
import { addOldRoutes } from './old-routes'
import { handlers } from './routes'

const ALLOWED_ORIGINS = [
  'https://predictarena.com',
  'https://www.predictarena.com',
  'https://predictarena.vercel.app',
]

export const allowCorsUnrestricted: RequestHandler = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true) // allow non-browser (curl, server-to-server)
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      /^https:\/\/predictarena-[a-z0-9-]+-apxlbs\.vercel\.app$/.test(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin)
    ) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`))
    }
  },
  maxAge: 86400,
})

function cacheController(policy?: string): RequestHandler {
  return (_req, res, next) => {
    if (policy) res.appendHeader('Cache-Control', policy)
    next()
  }
}
const ignoredEndpoints = [
  '/get-channel-messages',
  '/v0/user/by-id/',
  '/get-channel-memberships',
  '/v0/get-mod-reports',
  '/get-channel-seen-time',
]

const requestMonitoring: RequestHandler = (req, res, next) => {
  const traceContext = req.get('X-Cloud-Trace-Context')
  const traceId = traceContext ? traceContext.split('/')[0] : randomString(12)
  const { method, path: endpoint, url } = req
  const baseEndpoint = getBaseName(endpoint)
  const context = { endpoint, traceId, baseEndpoint }
  withMonitoringContext(context, () => {
    if (method == 'OPTIONS') {
      next()
      return
    }
    const startTs = hrtime.bigint()
    const isLocalhost = req.get('host')?.includes('localhost')
    if (!isLocalhost) {
      log(`${method} ${url} ${process.env.PORT}`)
    } else if (!ignoredEndpoints.some((e) => endpoint.startsWith(e))) {
      log(`${method} ${url}`)
    }
    metrics.inc('http/request_count', { baseEndpoint, method })
    res.on('close', () => {
      const endTs = hrtime.bigint()
      const latencyMs = Number(endTs - startTs) / 1e6 // Convert to milliseconds
      metrics.push('http/request_latency', latencyMs, {
        method,
        baseEndpoint,
      })
    })
    next()
  })
}

const getBaseName = (path: string) => {
  const parts = path.split('/').filter(Boolean)
  if (parts.length < 2) return path
  const base = parts[1]
  if (parts.length === 2) return `/${base}`
  const specificPaths = ['bet', 'user', 'group', 'market']
  if (specificPaths.includes(base)) {
    return `/${base}/*`
  }
  return base
}

export const apiErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  if (error instanceof APIError) {
    log.info(error)
    if (!res.headersSent) {
      const output: { [k: string]: unknown } = { message: error.message }
      if (error.details != null) {
        output.details = error.details
      }
      res.status(error.code).json(output)
    }
  } else {
    // Log full error server-side (including stack/pg details) but never expose to client
    log.error('Unhandled server error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message || 'Internal server error' })
    }
  }
}

export const app = express()
app.use(compression())

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

app.use(requestMonitoring)

app.options('*', allowCorsUnrestricted)

Object.entries(handlers).forEach(([path, handler]) => {
  const api = API[path as APIPath]
  const cache = cacheController((api as any).cache)
  const url = '/' + pathWithPrefix(path as APIPath)

  const apiRoute = [
    url,
    express.json(),
    allowCorsUnrestricted,
    cache,
    typedEndpoint(path as any, handler as any),
    apiErrorHandler,
  ] as const

  if (api.method === 'POST') {
    app.post(...apiRoute)
  } else if (api.method === 'GET') {
    app.get(...apiRoute)
    // } else if (api.method === 'PUT') {
    //   app.put(...apiRoute)
  } else {
    assertUnreachable(api, 'Unsupported API method')
  }
})

// Add MCP POST endpoint
app.post('/v0/mcp', express.json(), allowCorsUnrestricted, handleMcpRequest)

// Handle JSON parse errors with a clean 400 instead of 500
app.use(((err, _req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Invalid JSON in request body' })
    return
  }
  next(err)
}) as ErrorRequestHandler)

addOldRoutes(app)
