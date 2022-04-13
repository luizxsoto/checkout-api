import { HttpResponse } from '@/shared/contracts/presentation';

export function created(data: any): HttpResponse {
  return { statusCode: 201, body: data };
}
