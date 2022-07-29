import { Router } from 'express'

import { adaptRoute } from '@/main/adapters'
import { makeCreateSessionController } from '@/main/factories/controllers'

export function sessionRoutes(router: Router): void {
  router.post('/sessions', adaptRoute(makeCreateSessionController))
}
