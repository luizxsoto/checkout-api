import { makeCustomerModelMock } from '@tests/domain/mocks/models';

export function makeCreateCustomerUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeCustomerModelMock())),
  };
}
