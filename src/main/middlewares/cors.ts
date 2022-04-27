import { NextFunction, Request, Response } from 'express';

export function cors(req: Request, res: Response, next: NextFunction): void {
  res.set('access-control-allow-origin', '*');
  res.set('access-control-allow-headers', '*');
  res.set('access-control-allow-methods', '*');
  next();
}
