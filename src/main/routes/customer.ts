import { Router } from 'express';

import { adaptRoute } from '@/main/adapters';
import {
  makeCreateCustomerController,
  makeRemoveCustomerController,
  makeShowCustomerController,
  makeUpdateCustomerController,
} from '@/main/factories/controllers';

export function customerRoutes(router: Router): void {
  router.get('/customers/:id', adaptRoute(makeShowCustomerController));
  router.post('/customers', adaptRoute(makeCreateCustomerController));
  router.put('/customers/:id', adaptRoute(makeUpdateCustomerController));
  router.delete('/customers/:id', adaptRoute(makeRemoveCustomerController));
}
