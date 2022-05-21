import { StatusCodes } from '@/main/constants';
import { ApplicationException, InternalException } from '@/main/exceptions';
import { HttpResponse } from '@/presentation/contracts';

export function ok(data: any): HttpResponse {
  return { statusCode: StatusCodes.OK, body: data };
}

export function created(data: any): HttpResponse {
  return { statusCode: StatusCodes.CREATED, body: data };
}

export function notFound(): HttpResponse {
  return { statusCode: StatusCodes.NOT_FOUND, body: { message: 'Route not found' } };
}

export function serverError(error: Error): HttpResponse {
  let statusCode = StatusCodes.INTERNAL;
  let body = new InternalException(error);

  if (error instanceof ApplicationException) {
    statusCode = error.code;
    body = error;
  }

  return { statusCode, body };
}
