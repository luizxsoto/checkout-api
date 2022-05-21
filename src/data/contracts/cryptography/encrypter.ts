export interface Encrypter {
  encrypt: (params: Record<string, unknown>) => Promise<string>;
}
