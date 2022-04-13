import { HttpResponse } from './http';

export interface Controller<T> {
  handle: (params: T) => Promise<HttpResponse>;
}
