export function makeKnexStub(modelMock?: Record<string, unknown>) {
  return {
    table: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),

    returning: jest.fn(async () => Promise.resolve([modelMock])),
  };
}
