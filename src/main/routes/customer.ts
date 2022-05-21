import { Router } from 'express';

import { adaptRoute } from '@/main/adapters';
import {
  makeCreateCustomerController,
  makeListCustomerController,
  makeRemoveCustomerController,
  makeShowCustomerController,
  makeUpdateCustomerController,
} from '@/main/factories/controllers';
import { auth } from '@/main/middlewares';

export function customerRoutes(router: Router): void {
  router.get('/customers', auth(['admin', 'moderator']), adaptRoute(makeListCustomerController));
  router.get(
    '/customers/:id',
    auth(['admin', 'moderator']),
    adaptRoute(makeShowCustomerController),
  );
  router.post('/customers', auth(['admin', 'moderator']), adaptRoute(makeCreateCustomerController));
  router.put(
    '/customers/:id',
    auth(['admin', 'moderator']),
    adaptRoute(makeUpdateCustomerController),
  );
  router.delete(
    '/customers/:id',
    auth(['admin', 'moderator']),
    adaptRoute(makeRemoveCustomerController),
  );
}
