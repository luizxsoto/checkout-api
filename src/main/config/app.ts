import express, { Express } from 'express';

import { envConfig } from './env';
import { setupMiddlewares } from './middlewares';
import { setupRoutes } from './routes';

export function setupApp(setupNotFoundRoute = envConfig.nodeEnv !== 'test'): Express {
  const app = express();

  setupMiddlewares(app);
  setupRoutes(app, setupNotFoundRoute);

  return app;
}
