import { ApplicationException, InternalException } from '@/main/exceptions';
import { HttpResponse } from '@/presentation/contracts';

export function created(data: any): HttpResponse {
  return { statusCode: 201, body: data };
}

export function serverError(error: Error): HttpResponse {
  let statusCode = 500;
  let body = new InternalException(error);

  if (error instanceof ApplicationException) {
    const statusCodeDict: Record<string, number> = {
      VALIDATION_EXCEPTION: 400,
    };

    statusCode = statusCodeDict[error.code] ?? 500;
    body = error;
  }

  return { statusCode, body };
}
