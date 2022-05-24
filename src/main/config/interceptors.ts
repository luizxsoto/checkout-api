import { Express } from 'express';

import { exception } from '@/main/interceptors';

export function setupInterceptors(app: Express): void {
  app.use(exception);
}
