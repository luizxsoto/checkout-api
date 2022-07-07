import { Router } from 'express';

import { adaptRoute } from '@/main/adapters';
import {
  makeCreateOrderController,
  makeListOrderController,
  makeRemoveOrderController,
  makeShowOrderController,
  makeUpdateOrderController,
} from '@/main/factories/controllers';
import { auth } from '@/main/middlewares';

export function orderRoutes(router: Router): void {
  router.get('/orders', auth(['admin', 'moderator']), adaptRoute(makeListOrderController));
  router.get('/orders/:id', auth(['admin', 'moderator']), adaptRoute(makeShowOrderController));
  router.post('/orders', auth(['admin', 'moderator']), adaptRoute(makeCreateOrderController));
  router.put('/orders/:id', auth(['admin', 'moderator']), adaptRoute(makeUpdateOrderController));
  router.delete('/orders/:id', auth(['admin', 'moderator']), adaptRoute(makeRemoveOrderController));
}
