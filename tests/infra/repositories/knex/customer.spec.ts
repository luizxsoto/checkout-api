import { Knex } from 'knex';

import { DatabaseException } from '@/infra/exceptions';
import { KnexCustomerRepository } from '@/infra/repositories';
import { makeUuidServiceSub } from '@tests/data/stubs/services/uuid';
import { makeCustomerModelMock } from '@tests/domain/mocks/models';
import { makeKnexStub } from '@tests/infra/stubs';

function makeSut() {
  const knex = makeKnexStub(makeCustomerModelMock() as unknown as Record<string, unknown>);
  const uuidService = makeUuidServiceSub();
  const sut = new KnexCustomerRepository(knex as unknown as Knex, uuidService);

  return { knex, uuidService, sut };
}

describe(KnexCustomerRepository.name, () => {
  describe('create()', () => {
    test('Should create customer and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = { name: 'Any Name', email: 'any@email.com' };
      const responseModel = { ...requestModel, id: 'any_id', createdAt: new Date() };
      knex.returning.mockReturnValueOnce(
        Promise.resolve([responseModel as unknown as Record<string, unknown>]),
      );

      const sutResult = await sut.create(requestModel);

      expect(sutResult).toStrictEqual(responseModel);
    });

    test('Should throw DatabaseException if knex throws', async () => {
      const { knex, sut } = makeSut();

      const requestModel = { name: 'Any Name', email: 'any@email.com' };
      const error = new Error();
      knex.returning.mockReturnValueOnce(Promise.reject(error));

      const sutResult = await sut.create(requestModel).catch((e) => e);

      expect(sutResult).toStrictEqual(new DatabaseException(error));
    });
  });
});
