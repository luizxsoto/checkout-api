import { ApplicationException, InternalException } from '@/main/exceptions';
import { HttpResponse } from '@/presentation/contracts';

export function ok(data: any): HttpResponse {
  return { statusCode: 200, body: data };
}

export function created(data: any): HttpResponse {
  return { statusCode: 201, body: data };
}

export function notFound(): HttpResponse {
  return { statusCode: 404, body: { message: 'Route not found' } };
}

export function serverError(error: Error): HttpResponse {
  let statusCode = 500;
  let body = new InternalException(error);

  if (error instanceof ApplicationException) {
    statusCode = error.code;
    body = error;
  }

  return { statusCode, body };
}
