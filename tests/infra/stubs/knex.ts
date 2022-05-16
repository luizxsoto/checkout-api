export function makeKnexStub(modelMock?: Record<string, unknown>) {
  return {
    table: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    whereNull: jest.fn().mockReturnThis(),
    toQuery: jest.fn().mockReturnValue(''),
    returning: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),

    then: jest.fn((resolve, _reject) => resolve([modelMock])),
  };
}
