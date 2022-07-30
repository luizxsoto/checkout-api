import { makeUuidServiceStub } from '@tests/data/stubs/services'
import { makeSessionModelMock, makeUserModelMock } from '@tests/domain/mocks/models'
import { makeKnexStub } from '@tests/infra/stubs'
import { Knex } from 'knex'

import { Roles } from '@/domain/models'
import { KnexUserRepository } from '@/infra/repositories'

const userId = '00000000-0000-4000-8000-000000000001'
const session = makeSessionModelMock({ userId })

function makeSut() {
  const knex = makeKnexStub(makeUserModelMock() as unknown as Record<string, unknown>)
  const uuidService = makeUuidServiceStub()
  const sut = new KnexUserRepository(session, knex as unknown as Knex, uuidService)

  return { knex, uuidService, sut }
}

describe(KnexUserRepository.name, () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('findBy()', () => {
    test('Should findBy user and return correct values', async () => {
      const { knex, sut } = makeSut()

      const requestModel = {
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123'
      }
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]))
      const responseModel = { ...requestModel }

      const sutResult = await sut.findBy([requestModel])

      expect(sutResult).toStrictEqual([responseModel])
    })

    test('Should findBy user and return correct sanitized values', async () => {
      const { knex, sut } = makeSut()

      const requestModel = {
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123'
      }
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]))
      const responseModel = { ...requestModel }
      Reflect.deleteProperty(responseModel, 'password')

      const sutResult = await sut.findBy([requestModel], true)

      expect(sutResult).toStrictEqual([responseModel])
    })
  })

  describe('list()', () => {
    test('Should list user and return correct values', async () => {
      const { knex, sut } = makeSut()

      const requestModel = {
        password: 'Password@123'
      }
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]))
      const responseModel = { ...requestModel }
      Reflect.deleteProperty(responseModel, 'password')

      const sutResult = await sut.list({})

      expect(sutResult).toStrictEqual([responseModel])
    })
  })

  describe('create()', () => {
    test('Should create user and return correct values', async () => {
      const { knex, sut } = makeSut()

      const id = 'any_id'
      const requestModel = {
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123',
        roles: ['admin'] as Roles[]
      }
      knex.then.mockImplementationOnce((resolve) => resolve([{ ...requestModel, id }]))
      const responseModel = {
        ...requestModel,
        id,
        createUserId: userId,
        createdAt: new Date()
      }

      const [sutResult] = await sut.create([requestModel])

      expect(sutResult).toStrictEqual(responseModel)
    })
  })

  describe('update()', () => {
    test('Should update user and return correct values', async () => {
      const { knex, sut } = makeSut()

      const requestModel = {
        id: 'any_id',
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123',
        roles: [],
        createdAt: new Date()
      }
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]))
      const responseModel = { ...requestModel, updateUserId: userId, updatedAt: new Date() }

      const sutResult = await sut.update({ id: requestModel.id }, requestModel)

      expect(sutResult).toStrictEqual([responseModel])
    })
  })

  describe('remove()', () => {
    test('Should remove user and return correct values', async () => {
      const { knex, sut } = makeSut()

      const requestModel = { id: 'any_id' }
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]))
      const responseModel = { ...requestModel, deleteUserId: userId, deletedAt: new Date() }

      const sutResult = await sut.remove(requestModel)

      expect(sutResult).toStrictEqual([responseModel])
    })
  })
})
