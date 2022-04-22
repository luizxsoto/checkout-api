import { Router } from 'express';

import { makeCreateCustomerController } from '@/customers/main/factories/controllers';
import { adaptRoute } from '@/shared/adapters';

export function customerRoutes(router: Router): void {
  router.post('/customers', adaptRoute(makeCreateCustomerController()));
}
