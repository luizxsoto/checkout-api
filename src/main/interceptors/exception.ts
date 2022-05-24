import { NextFunction, Request, Response } from 'express';

import { serverError } from '@/presentation/helpers';

export function exception(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('[ExceptionInterceptor]', err);
  const httpResponse = serverError(err);

  res.status(httpResponse.statusCode).json(httpResponse.body);
}
