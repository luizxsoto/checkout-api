import { makePaymentProfileModelMock } from '@tests/domain/mocks/models';

export function makeListPaymentProfileUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve([makePaymentProfileModelMock()])),
  };
}

export function makeShowPaymentProfileUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makePaymentProfileModelMock())),
  };
}

export function makeCreatePaymentProfileUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makePaymentProfileModelMock())),
  };
}

export function makeUpdatePaymentProfileUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makePaymentProfileModelMock())),
  };
}

export function makeRemovePaymentProfileUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makePaymentProfileModelMock())),
  };
}
