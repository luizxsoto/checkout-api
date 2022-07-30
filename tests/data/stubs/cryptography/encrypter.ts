export function makeEncrypterCryptographyStub() {
  return {
    encrypt: jest.fn(async () => Promise.resolve('encrypted_string'))
  }
}
