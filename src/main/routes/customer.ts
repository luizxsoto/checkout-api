import { Router } from 'express';

import { adaptRoute } from '@/main/adapters';
import { makeCreateCustomerController } from '@/main/factories/controllers';

export function customerRoutes(router: Router): void {
  router.post('/customers', adaptRoute(makeCreateCustomerController()));
}
