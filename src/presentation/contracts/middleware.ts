export interface Middleware<T = any> {
  handle: (httpRequest: T) => Promise<Record<string, unknown>>
}
