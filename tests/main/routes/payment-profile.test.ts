import { resolve } from 'path';

import { Express } from 'express';
import request from 'supertest';

import { knexConfig, setupApp } from '@/main/config';
import { makeBearerTokenMock } from '@tests/domain/mocks/models';

const validUuidV4 = '10000000-0000-4000-8000-000000000001';
const existingUserId = '00000000-0000-4000-8000-000000000001';
const userId = '00000000-0000-4000-8000-000000000001';
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
let app: Express;

describe('PaymentProfile Routes', () => {
  beforeAll(async () => {
    app = setupApp();

    await knexConfig.migrate
      .latest({ directory: resolve('database/migrations') })
      .catch((error) => console.error('[knexConfig.migrate]', error));
  });

  afterEach(async () => {
    await knexConfig.table('payment_profiles').del();
  });

  afterAll(async () => {
    await knexConfig.destroy();
  });

  describe('list()', () => {
    test('Should list paymentProfile and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        userId: validUuidV4,
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        firstSix: '123456',
        lastFour: '3456',
        number: '1234567890123456',
        cvv: '123',
        expiryMonth: currentMonth,
        expiryYear: currentYear,
        createUserId: userId,
        createdAt: new Date().toISOString(),
      };

      await knexConfig.table('payment_profiles').insert(requestModel);

      const result = await request(app)
        .get('/api/payment-profiles')
        .query({ filters: `["=", "userId", "${requestModel.userId}"]` })
        .set('authorization', await makeBearerTokenMock())
        .send();

      expect(result.status).toBe(200);
      expect(result.body[0]?.id).toBe(requestModel.id);
      expect(result.body[0]?.userId).toBe(requestModel.userId);
      expect(result.body[0]?.type).toBe(requestModel.type);
      expect(result.body[0]?.brand).toBe(requestModel.brand);
      expect(result.body[0]?.holderName).toBe(requestModel.holderName);
      expect(result.body[0]?.firstSix).toBe(requestModel.firstSix);
      expect(result.body[0]?.lastFour).toBe(requestModel.lastFour);
      expect(result.body[0]?.number).toBeUndefined();
      expect(result.body[0]?.cvv).toBeUndefined();
      expect(result.body[0]?.expiryMonth).toBe(requestModel.expiryMonth);
      expect(result.body[0]?.expiryYear).toBe(requestModel.expiryYear);
      expect(result.body[0]?.createUserId).toBe(requestModel.createUserId);
      expect(result.body[0]?.createdAt).toBe(requestModel.createdAt);
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        filters: 'invalid_filters',
      };

      const result = await request(app)
        .get('/api/payment-profiles')
        .query(requestModel)
        .set('authorization', await makeBearerTokenMock())
        .send();

      expect(result.status).toBe(400);
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'filters',
            rule: 'listFilters',
            message:
              'This value must be a valid list filters and with this posible fields: userId, type, createUserId, updateUserId, createdAt, updatedAt',
          },
        ],
      });
    });
  });

  describe('show()', () => {
    test('Should show paymentProfile and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        userId: existingUserId,
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        firstSix: '123456',
        lastFour: '3456',
        number: '1234567890123456',
        cvv: '123',
        expiryMonth: currentMonth,
        expiryYear: currentYear,
        createUserId: userId,
        createdAt: new Date().toISOString(),
      };

      await knexConfig.table('payment_profiles').insert(requestModel);

      const result = await request(app)
        .get(`/api/payment-profiles/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send();

      expect(result.status).toBe(200);
      expect(result.body.id).toBe(requestModel.id);
      expect(result.body.userId).toBe(requestModel.userId);
      expect(result.body.type).toBe(requestModel.type);
      expect(result.body.brand).toBe(requestModel.brand);
      expect(result.body.holderName).toBe(requestModel.holderName);
      expect(result.body.firstSix).toBe(requestModel.firstSix);
      expect(result.body.lastFour).toBe(requestModel.lastFour);
      expect(result.body.number).toBeUndefined();
      expect(result.body.cvv).toBeUndefined();
      expect(result.body.expiryMonth).toBe(requestModel.expiryMonth);
      expect(result.body.expiryYear).toBe(requestModel.expiryYear);
      expect(result.body.createUserId).toBe(requestModel.createUserId);
      expect(result.body.createdAt).toBe(requestModel.createdAt);
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id',
      };

      const result = await request(app)
        .get(`/api/payment-profiles/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send();

      expect(result.status).toBe(400);
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'id',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: uuidV4',
          },
        ],
      });
    });
  });

  describe('create()', () => {
    test('Should create paymentProfile and return correct values', async () => {
      const requestModel = {
        userId: existingUserId,
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        number: '1234567890123456',
        cvv: '123',
        expiryMonth: currentMonth,
        expiryYear: currentYear,
      };
      const createUserId = userId;

      const result = await request(app)
        .post('/api/payment-profiles')
        .set('authorization', await makeBearerTokenMock({ userId }))
        .send(requestModel);

      expect(result.status).toBe(201);
      expect(result.body.userId).toBe(requestModel.userId);
      expect(result.body.type).toBe(requestModel.type);
      expect(result.body.brand).toBe(requestModel.brand);
      expect(result.body.holderName).toBe(requestModel.holderName);
      expect(result.body.firstSix).toBe(requestModel.number.slice(0, 6));
      expect(result.body.lastFour).toBe(requestModel.number.slice(-4));
      expect(result.body.number).toBeUndefined();
      expect(result.body.cvv).toBeUndefined();
      expect(result.body.expiryMonth).toBe(requestModel.expiryMonth);
      expect(result.body.expiryYear).toBe(requestModel.expiryYear);
      expect(result.body.id).toMatch(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      );
      expect(result.body.createUserId).toBe(createUserId);
      expect(result.body.createdAt).toBeDefined();
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        firstSix: '123456',
        lastFour: '3456',
        number: '1234567890123456',
        cvv: '123',
        expiryMonth: currentMonth,
        expiryYear: currentYear,
      };

      const result = await request(app)
        .post('/api/payment-profiles')
        .set('authorization', await makeBearerTokenMock())
        .send(requestModel);

      expect(result.status).toBe(400);
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'userId',
            rule: 'required',
            message: 'This value is required',
          },
        ],
      });
    });
  });

  describe('update()', () => {
    test('Should update paymentProfile and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        userId: existingUserId,
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        number: '1234567890123456',
        firstSix: '123456',
        lastFour: '3456',
        cvv: '123',
        expiryMonth: currentMonth,
        expiryYear: currentYear,
        createUserId: userId,
        createdAt: new Date().toISOString(),
      };
      const updateUserId = userId;

      await knexConfig.table('payment_profiles').insert(requestModel);

      const result = await request(app)
        .put(`/api/payment-profiles/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock({ userId }))
        .send(requestModel);

      expect(result.status).toBe(200);
      expect(result.body.id).toBe(requestModel.id);
      expect(result.body.userId).toBe(requestModel.userId);
      expect(result.body.type).toBe(requestModel.type);
      expect(result.body.brand).toBe(requestModel.brand);
      expect(result.body.holderName).toBe(requestModel.holderName);
      expect(result.body.firstSix).toBe(requestModel.number.slice(0, 6));
      expect(result.body.lastFour).toBe(requestModel.number.slice(-4));
      expect(result.body.number).toBeUndefined();
      expect(result.body.cvv).toBeUndefined();
      expect(result.body.expiryMonth).toBe(requestModel.expiryMonth);
      expect(result.body.expiryYear).toBe(requestModel.expiryYear);
      expect(result.body.createUserId).toBe(requestModel.createUserId);
      expect(result.body.updateUserId).toBe(updateUserId);
      expect(result.body.createdAt).toBe(requestModel.createdAt);
      expect(result.body.updatedAt).toBeDefined();
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id',
        userId: existingUserId,
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        firstSix: '123456',
        lastFour: '3456',
        number: '1234567890123456',
        cvv: '123',
        expiryMonth: currentMonth,
        expiryYear: currentYear,
      };

      const result = await request(app)
        .put(`/api/payment-profiles/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send(requestModel);

      expect(result.status).toBe(400);
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'id',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: uuidV4',
          },
        ],
      });
    });
  });

  describe('remove()', () => {
    test('Should remove paymentProfile and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        userId: existingUserId,
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        firstSix: '123456',
        lastFour: '3456',
        number: '1234567890123456',
        cvv: '123',
        expiryMonth: currentMonth,
        expiryYear: currentYear,
        createUserId: userId,
        updateUserId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const deleteUserId = userId;

      await knexConfig.table('payment_profiles').insert(requestModel);

      const result = await request(app)
        .delete(`/api/payment-profiles/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock({ userId }))
        .send();

      expect(result.status).toBe(200);
      expect(result.body.id).toBe(requestModel.id);
      expect(result.body.userId).toBe(requestModel.userId);
      expect(result.body.type).toBe(requestModel.type);
      expect(result.body.brand).toBe(requestModel.brand);
      expect(result.body.holderName).toBe(requestModel.holderName);
      expect(result.body.firstSix).toBe(requestModel.number.slice(0, 6));
      expect(result.body.lastFour).toBe(requestModel.number.slice(-4));
      expect(result.body.number).toBeUndefined();
      expect(result.body.cvv).toBeUndefined();
      expect(result.body.expiryMonth).toBe(requestModel.expiryMonth);
      expect(result.body.expiryYear).toBe(requestModel.expiryYear);
      expect(result.body.createUserId).toBe(requestModel.createUserId);
      expect(result.body.updateUserId).toBe(requestModel.updateUserId);
      expect(result.body.deleteUserId).toBe(deleteUserId);
      expect(result.body.createdAt).toBe(requestModel.createdAt);
      expect(result.body.updatedAt).toBe(requestModel.updatedAt);
      expect(result.body.deletedAt).toBeDefined();
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id',
      };

      const result = await request(app)
        .delete(`/api/payment-profiles/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send();

      expect(result.status).toBe(400);
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'id',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: uuidV4',
          },
        ],
      });
    });
  });
});
