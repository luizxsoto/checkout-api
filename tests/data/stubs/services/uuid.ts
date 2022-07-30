export function makeUuidServiceStub() {
  return {
    generateUniqueID: jest.fn(() => 'any_id')
  }
}
