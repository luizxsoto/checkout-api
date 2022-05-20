export function makeHashCompareCryptographyStub() {
  return {
    compare: jest.fn(async (string1, string2) => Promise.resolve(string1 === string2)),
  };
}
