import { HttpResponse } from '@/shared/contracts/presentation';
import { ApplicationException, InternalException } from '@/shared/exceptions';

export function created(data: any): HttpResponse {
  return { statusCode: 201, body: data };
}

export const serverError = (error: Error): HttpResponse => ({
  statusCode: 500,
  body: error instanceof ApplicationException ? error : new InternalException(error),
});
