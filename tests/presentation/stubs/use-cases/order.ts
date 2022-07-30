import { makeOrderItemModelMock, makeOrderModelMock } from '@tests/domain/mocks/models'

export function makeListOrderUseCaseStub() {
  return {
    execute: jest.fn(() =>
      Promise.resolve({
        page: 1,
        perPage: 20,
        lastPage: 1,
        total: 1,
        registers: [makeOrderModelMock()]
      })
    )
  }
}

export function makeShowOrderUseCaseStub() {
  return {
    execute: jest.fn(() =>
      Promise.resolve({ ...makeOrderModelMock(), orderItems: [makeOrderItemModelMock()] })
    )
  }
}

export function makeCreateOrderUseCaseStub() {
  return {
    execute: jest.fn(() =>
      Promise.resolve({ ...makeOrderModelMock(), orderItems: [makeOrderItemModelMock()] })
    )
  }
}

export function makeUpdateOrderUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeOrderModelMock()))
  }
}

export function makeRemoveOrderUseCaseStub() {
  return {
    execute: jest.fn(() =>
      Promise.resolve({ ...makeOrderModelMock(), orderItems: [makeOrderItemModelMock()] })
    )
  }
}
