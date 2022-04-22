import express, { Express } from 'express';

import { setupMiddlewares } from '@/middlewares';
import { setupRoutes } from '@/routes';

export function setupApp(): Express {
  const app = express();

  setupMiddlewares(app);
  setupRoutes(app);

  return app;
}
