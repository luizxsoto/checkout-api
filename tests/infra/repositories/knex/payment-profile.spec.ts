import { Knex } from 'knex';

import { PaymentProfileModel } from '@/domain/models';
import { KnexPaymentProfileRepository } from '@/infra/repositories';
import { makeUuidServiceStub } from '@tests/data/stubs/services';
import { makePaymentProfileModelMock, makeSessionModelMock } from '@tests/domain/mocks/models';
import { makeKnexStub } from '@tests/infra/stubs';

const userId = '00000000-0000-4000-8000-000000000001';
const session = makeSessionModelMock({ userId });

function makeSut() {
  const knex = makeKnexStub(makePaymentProfileModelMock() as unknown as Record<string, unknown>);
  const uuidService = makeUuidServiceStub();
  const sut = new KnexPaymentProfileRepository(session, knex as unknown as Knex, uuidService);

  return { knex, uuidService, sut };
}

describe(KnexPaymentProfileRepository.name, () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('findBy()', () => {
    test('Should findBy paymentProfile and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel: Partial<PaymentProfileModel> = {
        userId: 'any_userId',
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        number: 'any_number',
        firstSix: 'any_firstSix',
        lastFour: 'any_lastFour',
        cvv: 'any_cvv',
        expiryMonth: 1,
        expiryYear: 1,
      };
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]));
      const responseModel = { ...requestModel };

      const sutResult = await sut.findBy([requestModel]);

      expect(sutResult).toStrictEqual([responseModel]);
    });

    test('Should findBy paymentProfile and return correct sanitized values', async () => {
      const { knex, sut } = makeSut();

      const requestModel: Partial<PaymentProfileModel> = {
        userId: 'any_userId',
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        number: 'any_number',
        firstSix: 'any_firstSix',
        lastFour: 'any_lastFour',
        cvv: 'any_cvv',
        expiryMonth: 1,
        expiryYear: 1,
      };
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]));
      const responseModel = { ...requestModel };
      Reflect.deleteProperty(responseModel, 'number');
      Reflect.deleteProperty(responseModel, 'cvv');

      const sutResult = await sut.findBy([requestModel], true);

      expect(sutResult).toStrictEqual([responseModel]);
    });
  });

  describe('list()', () => {
    test('Should list paymentProfile and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel: Partial<PaymentProfileModel> = {
        userId: 'any_userId',
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        number: 'any_number',
        firstSix: 'any_firstSix',
        lastFour: 'any_lastFour',
        cvv: 'any_cvv',
        expiryMonth: 1,
        expiryYear: 1,
      };
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]));
      const responseModel = { ...requestModel };
      Reflect.deleteProperty(responseModel, 'number');
      Reflect.deleteProperty(responseModel, 'cvv');

      const sutResult = await sut.list({});

      expect(sutResult).toStrictEqual([responseModel]);
    });
  });

  describe('create()', () => {
    test('Should create paymentProfile and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel: Omit<
        PaymentProfileModel,
        | 'id'
        | 'createUserId'
        | 'updateUserId'
        | 'deleteUserId'
        | 'createdAt'
        | 'updatedAt'
        | 'deletedAt'
      > = {
        userId: 'any_userId',
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        number: 'any_number',
        firstSix: 'any_firstSix',
        lastFour: 'any_lastFour',
        cvv: 'any_cvv',
        expiryMonth: 1,
        expiryYear: 1,
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
    test('Should update paymentProfile and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel: Partial<
        Omit<
          PaymentProfileModel,
          'createUserId' | 'updateUserId' | 'deleteUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
        >
      > = {
        id: 'any_id',
        userId: 'any_userId',
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        number: 'any_number',
        firstSix: 'any_firstSix',
        lastFour: 'any_lastFour',
        cvv: 'any_cvv',
        expiryMonth: 1,
        expiryYear: 1,
      };
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]));
      const responseModel = {
        ...requestModel,
        updateUserId: userId,
        updatedAt: new Date(),
      };

      const sutResult = await sut.update({ id: requestModel.id }, requestModel);

      expect(sutResult).toStrictEqual([responseModel]);
    });
  });

  describe('remove()', () => {
    test('Should remove paymentProfile and return correct values', async () => {
      const { knex, sut } = makeSut();

      const requestModel = {
        id: 'any_id',
      };
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]));
      const responseModel = {
        ...requestModel,
        deleteUserId: userId,
        deletedAt: new Date(),
      };

      const sutResult = await sut.remove(requestModel);

      expect(sutResult).toStrictEqual([responseModel]);
    });
  });
});
