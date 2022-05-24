import { NextFunction, Request, Response } from 'express';

import { Controller } from '@/presentation/contracts';

export function adaptRoute(makeController: () => Controller) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = {
        ...(req.body ?? {}),
        ...(req.params ?? {}),
        ...(req.query ?? {}),
      };

      const controller = makeController();
      const httpResponse = await controller.handle(request);

      res.status(httpResponse.statusCode).json(httpResponse.body);
    } catch (err) {
      next(err);
    }
  };
}
