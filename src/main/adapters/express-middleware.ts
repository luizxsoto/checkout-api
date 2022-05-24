import { NextFunction, Request, Response } from 'express';

import { Middleware } from '@/presentation/contracts';

export function adaptMiddleware(middleware: Middleware) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = {
        ...req.headers,
        bearerToken: req.headers.authorization?.replace('Bearer ', ''),
      };

      const middlewareResponse = await middleware.handle(request);
      Object.assign(req, middlewareResponse);

      next();
    } catch (err) {
      next(err);
    }
  };
}
