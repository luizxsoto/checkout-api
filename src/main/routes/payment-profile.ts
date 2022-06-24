import { Router } from 'express';

import { adaptRoute } from '@/main/adapters';
import {
  makeCreatePaymentProfileController,
  makeListPaymentProfileController,
  makeRemovePaymentProfileController,
  makeShowPaymentProfileController,
  makeUpdatePaymentProfileController,
} from '@/main/factories/controllers';
import { auth } from '@/main/middlewares';

export function paymentProfileRoutes(router: Router): void {
  router.get(
    '/payment-profiles',
    auth(['admin', 'moderator']),
    adaptRoute(makeListPaymentProfileController),
  );
  router.get(
    '/payment-profiles/:id',
    auth(['admin', 'moderator']),
    adaptRoute(makeShowPaymentProfileController),
  );
  router.post(
    '/payment-profiles',
    auth(['admin', 'moderator']),
    adaptRoute(makeCreatePaymentProfileController),
  );
  router.put(
    '/payment-profiles/:id',
    auth(['admin', 'moderator']),
    adaptRoute(makeUpdatePaymentProfileController),
  );
  router.delete(
    '/payment-profiles/:id',
    auth(['admin', 'moderator']),
    adaptRoute(makeRemovePaymentProfileController),
  );
}
