import { NextFunction, Request, Response } from 'express'

import { SessionModel } from '@/domain/models'
import { Controller } from '@/presentation/contracts'

export function adaptRoute(
  makeController: (() => Controller) | ((session: SessionModel) => Controller)
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = {
        ...(req.body ?? {}),
        ...(req.params ?? {}),
        ...(req.query ?? {})
      }

      const controller = makeController(req.session as SessionModel)
      const httpResponse = await controller.handle(request)

      res.status(httpResponse.statusCode).json(httpResponse.body)
    } catch (err) {
      next(err)
    }
  }
}
