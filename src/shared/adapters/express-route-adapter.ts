import { Request, Response } from 'express';

import { Controller } from '@/shared/contracts/presentation';
import { serverError } from '@/shared/helpers';

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
      const httpResponse = serverError(err);

      res.status(httpResponse.statusCode).json(httpResponse.body);
    }
  };
}
