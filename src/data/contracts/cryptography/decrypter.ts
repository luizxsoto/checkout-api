export interface Decrypter {
  decrypt: <ResponseT>(ciphertext: string) => Promise<ResponseT>;
}
