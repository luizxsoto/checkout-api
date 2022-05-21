import { Knex } from 'knex';

import { Roles } from '@/domain/models';
import { KnexUserRepository } from '@/infra/repositories';
import { makeUuidServiceStub } from '@tests/data/stubs/services';
import { makeUserModelMock } from '@tests/domain/mocks/models';
import { makeKnexStub } from '@tests/infra/stubs';

function makeSut() {
  const knex = makeKnexStub(makeUserModelMock() as unknown as Record<string, unknown>);
  const uuidService = makeUuidServiceStub();
  const sut = new KnexUserRepository(knex as unknown as Knex, uuidService);

  return { knex, uuidService, sut };
}

describe(KnexUserRepository.name, () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('findBy()', () => {
    test('Should findBy user and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = {
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123',
      };
      const responseModel = { ...requestModel, id: 'any_id', createdAt: new Date() };
      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));

      const sutResult = await sut.findBy([requestModel]);

      expect(sutResult).toStrictEqual([responseModel]);
    });
  });

  describe('create()', () => {
    test('Should create user and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = {
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123',
        roles: ['admin'] as Roles[],
      };
      const responseModel = { ...requestModel, id: 'any_id', createdAt: new Date() };
      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));

      const sutResult = await sut.create(requestModel);

      expect(sutResult).toStrictEqual(responseModel);
    });
  });

  describe('update()', () => {
    test('Should update user and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = {
        id: 'any_id',
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123',
        createdAt: new Date(),
      };
      const responseModel = { ...requestModel, updatedAt: new Date() };
      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));

      const sutResult = await sut.update({ id: requestModel.id }, requestModel);

      expect(sutResult).toStrictEqual(responseModel);
    });
  });

  describe('remove()', () => {
    test('Should remove user and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = { id: 'any_id' };
      const responseModel = { ...requestModel, deletedAt: new Date() };
      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));

      const sutResult = await sut.remove(requestModel);

      expect(sutResult).toStrictEqual(responseModel);
    });
  });
});
