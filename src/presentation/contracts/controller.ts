import { HttpResponse } from './http';

export interface Controller<T = any> {
  handle: (params: T) => Promise<HttpResponse>;
}
