export function makeHasherCryptographyStub() {
  return {
    hash: jest.fn(async () => Promise.resolve('hashed_string')),
  };
}
