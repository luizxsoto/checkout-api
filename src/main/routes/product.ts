import { Router } from 'express';

import { adaptRoute } from '@/main/adapters';
import {
  makeCreateProductController,
  makeListProductController,
  makeRemoveProductController,
  makeShowProductController,
  makeUpdateProductController,
} from '@/main/factories/controllers';
import { auth } from '@/main/middlewares';

export function productRoutes(router: Router): void {
  router.get('/products', auth(['admin', 'moderator']), adaptRoute(makeListProductController));
  router.get('/products/:id', auth(['admin', 'moderator']), adaptRoute(makeShowProductController));
  router.post('/products', auth(['admin', 'moderator']), adaptRoute(makeCreateProductController));
  router.put(
    '/products/:id',
    auth(['admin', 'moderator']),
    adaptRoute(makeUpdateProductController),
  );
  router.delete(
    '/products/:id',
    auth(['admin', 'moderator']),
    adaptRoute(makeRemoveProductController),
  );
}
