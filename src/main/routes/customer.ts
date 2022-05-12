import { Router } from 'express';

import { adaptRoute } from '@/main/adapters';
import {
  makeCreateCustomerController,
  makeUpdateCustomerController,
} from '@/main/factories/controllers';

export function customerRoutes(router: Router): void {
  router.post('/customers', adaptRoute(makeCreateCustomerController));
  router.put('/customers/:id', adaptRoute(makeUpdateCustomerController));
}
