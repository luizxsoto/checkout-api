import { Knex } from 'knex';

// import { DatabaseException } from '@/infra/exceptions';
import { KnexBaseRepository } from '@/infra/repositories';
import { makeUuidServiceSub } from '@tests/data/stubs/services/uuid';
import { makeBaseModelMock } from '@tests/domain/mocks/models';
import { makeKnexStub } from '@tests/infra/stubs';

function makeSut() {
  const knex = makeKnexStub(makeBaseModelMock() as unknown as Record<string, unknown>);
  const uuidService = makeUuidServiceSub();
  const sut = new (class extends KnexBaseRepository {
    public find = this.baseFind;

    public create = this.baseCreate;

    public update = this.baseUpdate;

    public remove = this.baseRemove;
  })(knex as unknown as Knex, uuidService, 'table');

  return { knex, uuidService, sut };
}

describe(KnexBaseRepository.name, () => {
  describe('find()', () => {
    test('Should find register and return correct values', async () => {
      const { knex, sut } = makeSut();

      const query = knex.where('anyProp', 'anyValue');
      const responseModel = { anyProp: 'anyValue' };
      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));

      const sutResult = await sut.find(query);

      expect(sutResult).toStrictEqual([responseModel]);
    });

    // test('Should throw DatabaseException if knex throws', async () => {
    //   const { knex, sut } = makeSut();

    //   const requestModel = { name: 'Any Name', email: 'any@email.com' };
    //   const error = new Error();
    //   knex.then.mockImplementationOnce((_resolve, reject) => reject(error));

    //   const sutResult = await sut.create(requestModel).catch((e) => e);

    //   expect(sutResult).toStrictEqual(new DatabaseException(error, ''));
    // });
  });
});
