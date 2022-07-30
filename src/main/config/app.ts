import express, { Express } from 'express'

import { envConfig } from './env'
import { setupInterceptors } from './interceptors'
import { setupMiddlewares } from './middlewares'
import { setupRoutes } from './routes'
import { setupSwagger } from './swagger'

export function setupApp(setupNotFoundRoute = envConfig.nodeEnv !== 'test'): Express {
  const app = express()

  setupSwagger(app)
  setupMiddlewares(app)
  setupRoutes(app, setupNotFoundRoute)
  setupInterceptors(app)

  return app
}
