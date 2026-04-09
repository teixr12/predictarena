import { jsonEndpoint } from './helpers/endpoint'

export const health = jsonEndpoint(async (_req, res) => {
  res.status(200).json({ status: 'ok' })
  return {} as never
})
