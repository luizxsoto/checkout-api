import { Express, Router } from 'express';

import * as routes from '@/main/routes';

export function setupRoutes(app: Express): void {
  const router = Router();

  app.use('/api', router);

  Object.values(routes)
    .filter((route) => typeof route === 'function')
    .forEach((route) => route(router));
}
