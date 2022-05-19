import { Router } from 'express';

import { adaptRoute } from '@/main/adapters';
import {
  makeCreateUserController,
  makeListUserController,
  makeRemoveUserController,
  makeShowUserController,
  makeUpdateUserController,
} from '@/main/factories/controllers';

export function userRoutes(router: Router): void {
  router.get('/users', adaptRoute(makeListUserController));
  router.get('/users/:id', adaptRoute(makeShowUserController));
  router.post('/users', adaptRoute(makeCreateUserController));
  router.put('/users/:id', adaptRoute(makeUpdateUserController));
  router.delete('/users/:id', adaptRoute(makeRemoveUserController));
}
