import { makeCustomerModelMock } from '@tests/domain/mocks/models';

export function makeShowCustomerUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeCustomerModelMock())),
  };
}

export function makeCreateCustomerUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeCustomerModelMock())),
  };
}

export function makeUpdateCustomerUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeCustomerModelMock())),
  };
}

export function makeRemoveCustomerUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeCustomerModelMock())),
  };
}
