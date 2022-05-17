import { Express, Router } from 'express';

import { envConfig } from './env';

import * as routes from '@/main/routes';
import { notFound } from '@/presentation/helpers';

export function setupRoutes(app: Express, setupNotFoundRoute = envConfig.nodeEnv !== 'test'): void {
  const router = Router();

  app.use('/api', router);

  Object.values(routes)
    .filter((route) => typeof route === 'function')
    .forEach((route) => route(router));

  if (setupNotFoundRoute) {
    app.use((_req, res) => {
      const httpResponse = notFound();

      res.status(httpResponse.statusCode).json(httpResponse.body);
    });
  }
}
