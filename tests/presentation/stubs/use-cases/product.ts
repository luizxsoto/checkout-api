import { makeProductModelMock } from '@tests/domain/mocks/models'

export function makeListProductUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve([makeProductModelMock()])),
  }
}

export function makeShowProductUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeProductModelMock())),
  }
}

export function makeCreateProductUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeProductModelMock())),
  }
}

export function makeUpdateProductUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeProductModelMock())),
  }
}

export function makeRemoveProductUseCaseStub() {
  return {
    execute: jest.fn(() => Promise.resolve(makeProductModelMock())),
  }
}
