import { Knex } from 'knex';

import { KnexCustomerRepository } from '@/infra/repositories';
import { makeUuidServiceStub } from '@tests/data/stubs/services';
import { makeCustomerModelMock } from '@tests/domain/mocks/models';
import { makeKnexStub } from '@tests/infra/stubs';

function makeSut() {
  const knex = makeKnexStub(makeCustomerModelMock() as unknown as Record<string, unknown>);
  const uuidService = makeUuidServiceStub();
  const sut = new KnexCustomerRepository(knex as unknown as Knex, uuidService);

  return { knex, uuidService, sut };
}

describe(KnexCustomerRepository.name, () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('findBy()', () => {
    test('Should findBy customer and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = { name: 'Any Name', email: 'any@email.com' };
      const responseModel = { ...requestModel, id: 'any_id', createdAt: new Date() };
      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));

      const sutResult = await sut.findBy([requestModel]);

      expect(sutResult).toStrictEqual([responseModel]);
    });
  });

  describe('create()', () => {
    test('Should create customer and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = {
        name: 'Any Name',
        email: 'any@email.com',
        createUserId: '00000000-0000-4000-8000-000000000001',
      };
      const responseModel = { ...requestModel, id: 'any_id', createdAt: new Date() };
      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));

      const sutResult = await sut.create(requestModel);

      expect(sutResult).toStrictEqual(responseModel);
    });
  });

  describe('update()', () => {
    test('Should update customer and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = {
        id: 'any_id',
        name: 'Any Name',
        email: 'any@email.com',
        updateUserId: '00000000-0000-4000-8000-000000000001',
        createdAt: new Date(),
      };
      const responseModel = { ...requestModel, updatedAt: new Date() };
      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));

      const sutResult = await sut.update({ id: requestModel.id }, requestModel);

      expect(sutResult).toStrictEqual(responseModel);
    });
  });

  describe('remove()', () => {
    test('Should remove customer and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = { id: 'any_id', deleteUserId: '00000000-0000-4000-8000-000000000001' };
      const responseModel = { ...requestModel, deletedAt: new Date() };
      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));

      const sutResult = await sut.remove(requestModel);

      expect(sutResult).toStrictEqual(responseModel);
    });
  });
});
