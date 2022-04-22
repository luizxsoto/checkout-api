import { Request, Response } from 'express';

import { Controller } from '@/shared/contracts/presentation';

export function adaptRoute(controller: Controller) {
  return async (req: Request, res: Response) => {
    const request = {
      ...(req.body || {}),
      ...(req.params || {}),
    };

    const httpResponse = await controller.handle(request);

    res.status(httpResponse.statusCode).json(httpResponse.body);
  };
}
