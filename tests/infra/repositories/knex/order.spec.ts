import { Knex } from 'knex';

import { OrderStatus } from '@/domain/models';
import { KnexOrderRepository } from '@/infra/repositories';
import { makeUuidServiceStub } from '@tests/data/stubs/services';
import { makeOrderModelMock, makeSessionModelMock } from '@tests/domain/mocks/models';
import { makeKnexStub } from '@tests/infra/stubs';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';
const userId = validUuidV4;
const session = makeSessionModelMock({ userId });

function makeSut() {
  const knex = makeKnexStub(makeOrderModelMock() as unknown as Record<string, unknown>);
  const uuidService = makeUuidServiceStub();
  const sut = new KnexOrderRepository(session, knex as unknown as Knex, uuidService);

  return { knex, uuidService, sut };
}

describe(KnexOrderRepository.name, () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('findBy()', () => {
    test('Should findBy order and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = {
        customerId: validUuidV4,
        paymentProfileId: validUuidV4,
        status: 'PAID' as OrderStatus,
        totalValue: 1000,
      };
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]));
      const responseModel = { ...requestModel };

      const sutResult = await sut.findBy([requestModel]);

      expect(sutResult).toStrictEqual([responseModel]);
    });
  });

  describe('list()', () => {
    test('Should list order and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = {
        customerId: validUuidV4,
        paymentProfileId: validUuidV4,
        status: 'PAID' as OrderStatus,
        totalValue: 1000,
      };
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]));
      const responseModel = { ...requestModel };

      const sutResult = await sut.list({});

      expect(sutResult).toStrictEqual([responseModel]);
    });
  });

  describe('create()', () => {
    test('Should create order and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = {
        customerId: validUuidV4,
        paymentProfileId: validUuidV4,
        status: 'PAID' as OrderStatus,
        totalValue: 1000,
      };
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]));
      const responseModel = {
        ...requestModel,
        id: 'any_id',
        createUserId: userId,
        createdAt: new Date(),
      };

      const sutResult = await sut.create(requestModel);

      expect(sutResult).toStrictEqual(responseModel);
    });
  });

  describe('update()', () => {
    test('Should update order and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = {
        id: 'any_id',
        customerId: validUuidV4,
        paymentProfileId: validUuidV4,
        status: 'PAID' as OrderStatus,
        totalValue: 1000,
        createdAt: new Date(),
      };
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]));
      const responseModel = { ...requestModel, updateUserId: userId, updatedAt: new Date() };

      const sutResult = await sut.update({ id: requestModel.id }, requestModel);

      expect(sutResult).toStrictEqual([responseModel]);
    });
  });

  describe('remove()', () => {
    test('Should remove order and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = { id: 'any_id' };
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]));
      const responseModel = { ...requestModel, deleteUserId: userId, deletedAt: new Date() };

      const sutResult = await sut.remove(requestModel);

      expect(sutResult).toStrictEqual([responseModel]);
    });
  });
});
