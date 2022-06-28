import { Knex } from 'knex';

import { BaseModel } from '@/domain/models';
import { KnexBaseRepository } from '@/infra/repositories';
import { DatabaseException } from '@/main/exceptions';
import { makeUuidServiceStub } from '@tests/data/stubs/services';
import { makeBaseModelMock, makeSessionModelMock } from '@tests/domain/mocks/models';
import { makeKnexStub } from '@tests/infra/stubs';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';
const userId = validUuidV4;
const session = makeSessionModelMock({ userId });

function makeSut() {
  const knex = makeKnexStub(makeBaseModelMock() as unknown as Record<string, unknown>);
  const uuidService = makeUuidServiceStub();
  const tableName = 'tableName';
  const sut = new (class extends KnexBaseRepository {
    public run = this.baseRun;

    public find = this.baseFind;

    public list = this.baseList;

    public create = this.baseCreate;

    public update = this.baseUpdate;

    public remove = this.baseRemove;
  })(session, knex as unknown as Knex, uuidService, tableName);

  return { knex, uuidService, tableName, sut };
}

describe(KnexBaseRepository.name, () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('Should throw DatabaseException if knex throws', async () => {
    const { knex, sut } = makeSut();

    const query = knex.where('anyProp', 'anyValue');
    const error = new Error();
    knex.then.mockImplementationOnce((_resolve, reject) => reject(error));

    const sutResult = await sut.run(query).catch((e) => e);

    expect(sutResult).toStrictEqual(new DatabaseException(error, ''));
  });

  describe('find()', () => {
    test('Should find register and return correct values', async () => {
      const { knex, sut } = makeSut();

      const query = knex.where('anyProp', 'anyValue');
      const responseModel = { anyProp: 'anyValue' };
      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));

      const sutResult = await sut.find(query);

      expect(sutResult).toStrictEqual([responseModel]);
      expect(knex.whereNull).toBeCalledWith('deletedAt');
    });

    test('Should not filter whereNull deletedAt if withDeleted was informed', async () => {
      const { knex, sut } = makeSut();

      const query = knex.where('anyProp', 'anyValue');
      const responseModel = { anyProp: 'anyValue' };
      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));

      const withDeleted = true;
      await sut.find(query, withDeleted);

      expect(knex.whereNull).not.toBeCalled();
    });
  });

  describe('list()', () => {
    test('Should list register and return correct values', async () => {
      const { knex, tableName, sut } = makeSut();

      const requestModel = {
        page: 1,
        perPage: 20,
        orderBy: 'orderBy',
        order: 'desc',
        filters:
          '["&", ["|", ["=", "anyProp", "anyValue"], ["!=", "anyProp", "anyValue"], [">", "anyProp", "anyValue"], [">=", "anyProp", "anyValue"], ["<", "anyProp", "anyValue"], ["<=", "anyProp", "anyValue"], [":", "anyProp", "anyValue"], ["!:", "anyProp", "anyValue"], ["in", "anyProp", ["anyValue"]]]]',
      };
      const responseModel = { anyProp: 'anyValue' };

      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));
      knex.where.mockImplementation((cb) => {
        if (typeof cb === 'function') cb(knex);
        return knex;
      });
      knex.orWhere.mockImplementation((cb) => {
        if (typeof cb === 'function') cb(knex);
        return knex;
      });

      const sutResult = await sut.list(requestModel);

      expect(sutResult).toStrictEqual([responseModel]);
      expect(knex.whereNull).toBeCalledWith('deletedAt');
      expect(knex.table).toBeCalledWith(tableName);
      expect(knex.where).toBeCalledWith('anyProp', 'anyValue');
      expect(knex.offset).toBeCalledWith(requestModel.perPage - 1 * requestModel.perPage);
      expect(knex.limit).toBeCalledWith(requestModel.perPage);
      expect(knex.orderBy).toBeCalledWith(requestModel.orderBy, requestModel.order);
      knex.where.mockReset();
      knex.orWhere.mockReset();
    });

    test('Should use default values for page, perPage, orderBy, order and filters', async () => {
      const { knex, tableName, sut } = makeSut();

      const requestModel = {};
      const responseModel = { anyProp: 'anyValue' };
      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));
      knex.where.mockImplementationOnce((cb) => {
        cb(knex);
        return knex;
      });

      const sutResult = await sut.list(requestModel as any);

      expect(sutResult).toStrictEqual([responseModel]);
      expect(knex.whereNull).toBeCalledWith('deletedAt');
      expect(knex.table).toBeCalledWith(tableName);
      expect(knex.offset).toBeCalledWith(0 * 20);
      expect(knex.limit).toBeCalledWith(20);
      expect(knex.orderBy).toBeCalledWith('createdAt', 'desc');
    });

    test('Should not filter whereNull deletedAt if withDeleted was informed', async () => {
      const { knex, tableName, sut } = makeSut();

      const requestModel = { page: 1, perPage: 20 };
      const responseModel = { anyProp: 'anyValue' };
      knex.then.mockImplementationOnce((resolve) => resolve([responseModel]));
      knex.where.mockImplementationOnce((cb) => {
        cb(knex);
        return knex;
      });

      const withDeleted = true;
      await sut.list(requestModel, withDeleted);

      expect(knex.whereNull).not.toBeCalled();
      expect(knex.table).toBeCalledWith(tableName);
      expect(knex.offset).toBeCalledWith(requestModel.perPage - 1 * requestModel.perPage);
      expect(knex.limit).toBeCalledWith(requestModel.perPage);
    });
  });

  describe('create()', () => {
    test('Should create register and return correct values', async () => {
      const { knex, uuidService, tableName, sut } = makeSut();

      const requestModel = {
        anyProp: 'anyValue',
      };
      const responseModel = {
        ...requestModel,
        id: validUuidV4,
        createUserId: userId,
        createdAt: new Date(),
      };
      uuidService.generateUniqueID.mockReturnValueOnce(validUuidV4);

      const sutResult = await sut.create(requestModel);

      expect(sutResult).toStrictEqual(responseModel);
      expect(uuidService.generateUniqueID).toBeCalledWith();
      expect(knex.table).toBeCalledWith(tableName);
      expect(knex.insert).toBeCalledWith(responseModel);
    });

    test('Should validate if repository result is a number', async () => {
      const { knex, uuidService, tableName, sut } = makeSut();

      const requestModel = {
        anyProp: 'anyValue',
      };
      const responseModel = {
        ...requestModel,
        id: validUuidV4,
        createUserId: userId,
        createdAt: new Date(),
      };
      uuidService.generateUniqueID.mockReturnValueOnce(validUuidV4);
      knex.then.mockImplementationOnce((resolve) => resolve(1));

      const sutResult = await sut.create(requestModel);

      expect(sutResult).toStrictEqual(responseModel);
      expect(uuidService.generateUniqueID).toBeCalledWith();
      expect(knex.table).toBeCalledWith(tableName);
      expect(knex.insert).toBeCalledWith(responseModel);
    });
  });

  describe('update()', () => {
    test('Should update register correctly', async () => {
      const { knex, tableName, sut } = makeSut();

      const where = { anyProp: 'anyValue' };
      const requestModel = {
        anyProp: 'otherValue',
      };
      const updateModel = {
        ...requestModel,
        updateUserId: userId,
        updatedAt: new Date(),
      };
      knex.then.mockImplementationOnce((resolve) => resolve([updateModel]));

      const sutResult = await sut.update(where as unknown as BaseModel, requestModel);

      expect(sutResult).toStrictEqual([updateModel]);
      expect(knex.table).toBeCalledWith(tableName);
      expect(knex.update).toBeCalledWith(updateModel);
      expect(knex.where).toBeCalledWith(where);
    });

    test('Should validate if repository result is a number', async () => {
      const { knex, tableName, sut } = makeSut();

      const where = { anyProp: 'anyValue' };
      const requestModel = {
        anyProp: 'otherValue',
      };
      const updateModel = {
        ...requestModel,
        updateUserId: userId,
        updatedAt: new Date(),
      };
      knex.then.mockImplementationOnce((resolve) => resolve(1));

      const sutResult = await sut.update(where as unknown as BaseModel, requestModel);

      expect(sutResult).toStrictEqual([updateModel]);
      expect(knex.table).toBeCalledWith(tableName);
      expect(knex.update).toBeCalledWith(updateModel);
      expect(knex.where).toBeCalledWith(where);
    });
  });

  describe('remove()', () => {
    test('Should remove register correctly', async () => {
      const { knex, tableName, sut } = makeSut();

      const where = { anyProp: 'anyValue' };
      const removeModel = {
        ...where,
        deleteUserId: userId,
        deletedAt: new Date(),
      };
      knex.then.mockImplementationOnce((resolve) => resolve([removeModel]));

      const sutResult = await sut.remove(where as unknown as BaseModel);

      expect(sutResult).toStrictEqual([removeModel]);
      expect(knex.table).toBeCalledWith(tableName);
      expect(knex.update).toBeCalledWith(removeModel);
      expect(knex.where).toBeCalledWith(where);
    });

    test('Should validate if repository result is a number', async () => {
      const { knex, tableName, sut } = makeSut();

      const where = { anyProp: 'anyValue' };
      const removeModel = {
        ...where,
        deleteUserId: userId,
        deletedAt: new Date(),
      };
      knex.then.mockImplementationOnce((resolve) => resolve(1));

      const sutResult = await sut.remove(where as unknown as BaseModel);

      expect(sutResult).toStrictEqual([removeModel]);
      expect(knex.table).toBeCalledWith(tableName);
      expect(knex.update).toBeCalledWith(removeModel);
      expect(knex.where).toBeCalledWith(where);
    });
  });
});
