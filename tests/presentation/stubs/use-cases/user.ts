import { makeUserModelMock } from '@tests/domain/mocks/models'

export function makeListUserUseCaseStub() {
  return {
    execute: jest.fn(() =>
      Promise.resolve({
        page: 1,
        perPage: 20,
        lastPage: 1,
        total: 1,
        registers: [makeUserModelMock()]
      })
    )
  }
}

export function makeShowUserUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeUserModelMock()))
  }
}

export function makeCreateUserUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeUserModelMock()))
  }
}

export function makeUpdateUserUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeUserModelMock()))
  }
}

export function makeRemoveUserUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeUserModelMock()))
  }
}
