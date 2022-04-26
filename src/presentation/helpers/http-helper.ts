import { ApplicationException, InternalException } from '@/main/exceptions';
import { HttpResponse } from '@/presentation/contracts';

export function created(data: any): HttpResponse {
  return { statusCode: 201, body: data };
}

export const serverError = (error: Error): HttpResponse => ({
  statusCode: 500,
  body: error instanceof ApplicationException ? error : new InternalException(error),
});
