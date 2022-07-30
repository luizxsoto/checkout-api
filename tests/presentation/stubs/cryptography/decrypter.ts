export function makeDecrypterCryptographyStub() {
  return {
    decrypt: jest.fn(async (bearerToken) => {
      if (bearerToken === 'invalid_bearerToken') throw Error()

      return Promise.resolve({} as any)
    })
  }
}
