/* eslint-disable @typescript-eslint/ban-ts-comment */
export function makeKnexStub(modelMock?: Record<string, unknown>) {
  return {
    table: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    whereNot: jest.fn().mockReturnThis(),
    whereRaw: jest.fn().mockReturnThis(),
    whereIn: jest.fn().mockReturnThis(),
    whereNull: jest.fn().mockReturnThis(),
    toQuery: jest.fn().mockReturnValue(''),
    returning: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),

    then: jest.fn((resolve, _reject) => resolve([modelMock]))
  }
}
