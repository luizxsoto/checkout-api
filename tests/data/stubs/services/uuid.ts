export function makeUuidServiceSub() {
  return {
    generateUniqueID: jest.fn(() => 'any_id'),
  };
}
