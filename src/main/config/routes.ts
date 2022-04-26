import { Express, Router } from 'express';

import * as customerRoutes from '@/main/routes';

const routes = { ...customerRoutes };

export function setupRoutes(app: Express): void {
  const router = Router();

  app.use('/api', router);

  Object.values(routes).map((route) => route(router));
}
