import { Router } from 'express'

import { adaptRoute } from '@/main/adapters'
import { makeCreateSessionController } from '@/main/factories/controllers'
import { auth } from '@/main/middlewares'

export function sessionRoutes(router: Router): void {
  router.post('/sessions', auth([], true), adaptRoute(makeCreateSessionController))
}
