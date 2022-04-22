import express, { Express } from 'express';

import { setupRoutes } from '@/routes';

export function setupApp(): Express {
  const app = express();

  setupRoutes(app);

  return app;
}
