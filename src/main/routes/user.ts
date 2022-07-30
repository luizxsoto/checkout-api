import { Router } from 'express'

import { adaptRoute } from '@/main/adapters'
import {
  makeCreateUserController,
  makeListUserController,
  makeRemoveUserController,
  makeShowUserController,
  makeUpdateUserController
} from '@/main/factories/controllers'
import { auth } from '@/main/middlewares'

export function userRoutes(router: Router): void {
  router.get('/users', auth(['admin']), adaptRoute(makeListUserController))
  router.get('/users/:id', auth(['admin']), adaptRoute(makeShowUserController))
  router.post('/users', auth(['admin']), adaptRoute(makeCreateUserController))
  router.put('/users/:id', auth(['admin']), adaptRoute(makeUpdateUserController))
  router.delete('/users/:id', auth(['admin']), adaptRoute(makeRemoveUserController))
}
