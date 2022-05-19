import { makeUserModelMock } from '@tests/domain/mocks/models';

export function makeListUserUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve([makeUserModelMock()])),
  };
}

export function makeShowUserUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeUserModelMock())),
  };
}

export function makeCreateUserUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeUserModelMock())),
  };
}

export function makeUpdateUserUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeUserModelMock())),
  };
}

export function makeRemoveUserUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeUserModelMock())),
  };
}
