import { Request, Response } from 'express';

import { Controller } from '@/presentation/contracts';
import { serverError } from '@/presentation/helpers';

export function adaptRoute(controller: Controller) {
  return async (req: Request, res: Response) => {
    try {
      const request = {
        ...(req.body ?? {}),
        ...(req.params ?? {}),
      };

      const httpResponse = await controller.handle(request);

      res.status(httpResponse.statusCode).json(httpResponse.body);
    } catch (err) {
      console.error('[Express.adaptRoute]', err);
      const httpResponse = serverError(err);

      res.status(httpResponse.statusCode).json(httpResponse.body);
    }
  };
}
