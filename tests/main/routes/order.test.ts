import { resolve } from 'path';

import { Express } from 'express';
import request from 'supertest';

import { knexConfig, setupApp } from '@/main/config';
import { makeBearerTokenMock } from '@tests/domain/mocks/models';

const validUuidV4 = '10000000-0000-4000-8000-000000000001';
const existingUserId = '00000000-0000-4000-8000-000000000001';
const existingProductId = '00000000-0000-4000-8000-000000000001';
const userId = '00000000-0000-4000-8000-000000000001';
let app: Express;

describe('Order Routes', () => {
  beforeAll(async () => {
    app = setupApp();

    await knexConfig.migrate
      .latest({ directory: resolve('database/migrations') })
      .catch((error) => console.error('[knexConfig.migrate]', error));
  });

  afterEach(async () => {
    await knexConfig.table('orders').del();
    await knexConfig.table('order_items').del();
  });

  afterAll(async () => {
    await knexConfig.destroy();
  });

  describe('list()', () => {
    test('Should list order and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        userId: validUuidV4,
        totalValue: 1000,
        createUserId: userId,
        createdAt: new Date().toISOString(),
      };

      await knexConfig.table('orders').insert(requestModel);

      const result = await request(app)
        .get('/api/orders')
        .query({ filters: `["=", "userId", "${requestModel.userId}"]` })
        .set('authorization', await makeBearerTokenMock())
        .send();

      expect(result.status).toBe(200);
      expect(result.body[0]?.id).toBe(requestModel.id);
      expect(result.body[0]?.userId).toBe(requestModel.userId);
      expect(result.body[0]?.totalValue).toBe(requestModel.totalValue);
      expect(result.body[0]?.createUserId).toBe(requestModel.createUserId);
      expect(result.body[0]?.createdAt).toBe(requestModel.createdAt);
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        filters: 'invalid_filters',
      };

      const result = await request(app)
        .get('/api/orders')
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
              'This value must be a valid list filters and with this posible fields: userId, totalValue, createUserId, updateUserId, createdAt, updatedAt',
          },
        ],
      });
    });
  });

  describe('show()', () => {
    test('Should show order and return correct values', async () => {
      const orderModel = {
        id: validUuidV4,
        userId: validUuidV4,
        totalValue: 1000,
        createUserId: userId,
        createdAt: new Date().toISOString(),
      };
      const orderItemModel = {
        id: validUuidV4,
        orderId: validUuidV4,
        productId: validUuidV4,
        quantity: 1,
        unitValue: 1000,
        totalValue: 1000,
        createUserId: userId,
        createdAt: new Date().toISOString(),
      };

      await knexConfig.table('orders').insert(orderModel);
      await knexConfig.table('order_items').insert(orderItemModel);

      const result = await request(app)
        .get(`/api/orders/${orderModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send();

      expect(result.status).toBe(200);
      expect(result.body.id).toBe(orderModel.id);
      expect(result.body.userId).toBe(orderModel.userId);
      expect(result.body.totalValue).toBe(orderModel.totalValue);
      expect(result.body.createUserId).toBe(orderModel.createUserId);
      expect(result.body.createdAt).toBe(orderModel.createdAt);
      expect(result.body.orderItems?.[0]?.id).toBe(orderItemModel.id);
      expect(result.body.orderItems?.[0]?.orderId).toBe(orderItemModel.orderId);
      expect(result.body.orderItems?.[0]?.productId).toBe(orderItemModel.productId);
      expect(result.body.orderItems?.[0]?.quantity).toBe(orderItemModel.quantity);
      expect(result.body.orderItems?.[0]?.unitValue).toBe(orderItemModel.unitValue);
      expect(result.body.orderItems?.[0]?.totalValue).toBe(orderItemModel.totalValue);
      expect(result.body.orderItems?.[0]?.createUserId).toBe(orderItemModel.createUserId);
      expect(result.body.orderItems?.[0]?.createdAt).toBe(orderItemModel.createdAt);
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id',
      };

      const result = await request(app)
        .get(`/api/orders/${requestModel.id}`)
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
    test('Should create order and return correct values', async () => {
      const requestModel = {
        userId: existingUserId,
        orderItems: [{ productId: existingProductId, quantity: 1 }],
      };
      const createUserId = userId;
      const productPrice = 1000;

      const result = await request(app)
        .post('/api/orders')
        .set('authorization', await makeBearerTokenMock({ userId: createUserId }))
        .send(requestModel);

      expect(result.status).toBe(201);
      expect(result.body.userId).toBe(requestModel.userId);
      expect(result.body.orderItems?.[0]?.productId).toBe(requestModel.orderItems[0].productId);
      expect(result.body.orderItems?.[0]?.quantity).toBe(requestModel.orderItems[0].quantity);
      expect(result.body.totalValue).toBe(productPrice);
      expect(result.body.orderItems?.[0]?.unitValue).toBe(productPrice);
      expect(result.body.orderItems?.[0]?.totalValue).toBe(productPrice);
      expect(result.body.createUserId).toBe(createUserId);
      expect(result.body.orderItems?.[0]?.createUserId).toBe(createUserId);
      expect(result.body.id).toMatch(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      );
      expect(result.body.orderItems?.[0]?.id).toMatch(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      );
      expect(result.body.orderItems?.[0]?.orderId).toMatch(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      );
      expect(result.body.createdAt).toBeDefined();
      expect(result.body.orderItems?.[0]?.createdAt).toBeDefined();
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        orderItems: [{ productId: validUuidV4, quantity: 1 }],
      };

      const result = await request(app)
        .post('/api/orders')
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
    test('Should update order and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        userId: existingUserId,
        totalValue: 1000,
        createUserId: userId,
        createdAt: new Date().toISOString(),
      };
      const updateUserId = userId;

      await knexConfig.table('orders').insert(requestModel);

      const result = await request(app)
        .put(`/api/orders/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock({ userId: updateUserId }))
        .send(requestModel);

      expect(result.status).toBe(200);
      expect(result.body.id).toBe(requestModel.id);
      expect(result.body.userId).toBe(requestModel.userId);
      expect(result.body.totalValue).toBe(requestModel.totalValue);
      expect(result.body.createUserId).toBe(requestModel.createUserId);
      expect(result.body.updateUserId).toBe(updateUserId);
      expect(result.body.createdAt).toBe(requestModel.createdAt);
      expect(result.body.updatedAt).toBeDefined();
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id',
        userId: validUuidV4,
      };

      const result = await request(app)
        .put(`/api/orders/${requestModel.id}`)
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
    test('Should remove order and return correct values', async () => {
      const orderModel = {
        id: validUuidV4,
        userId: validUuidV4,
        totalValue: 1000,
        createUserId: userId,
        updateUserId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const orderItemModel = {
        id: validUuidV4,
        orderId: validUuidV4,
        productId: validUuidV4,
        quantity: 1,
        unitValue: 1000,
        totalValue: 1000,
        createUserId: userId,
        updateUserId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const deleteUserId = userId;

      await knexConfig.table('orders').insert(orderModel);
      await knexConfig.table('order_items').insert(orderItemModel);

      const result = await request(app)
        .delete(`/api/orders/${orderModel.id}`)
        .set('authorization', await makeBearerTokenMock({ userId: deleteUserId }))
        .send();

      if (result.body.id) {
        result.body.orderItem = await knexConfig
          .table('order_items')
          .where('orderId', orderModel.id);
      }

      expect(result.status).toBe(200);
      expect(result.body.id).toBe(orderModel.id);
      expect(result.body.userId).toBe(orderModel.userId);
      expect(result.body.totalValue).toBe(orderModel.totalValue);
      expect(result.body.createUserId).toBe(orderModel.createUserId);
      expect(result.body.updateUserId).toBe(orderModel.updateUserId);
      expect(result.body.deleteUserId).toBe(deleteUserId);
      expect(result.body.createdAt).toBe(orderModel.createdAt);
      expect(result.body.updatedAt).toBe(orderModel.updatedAt);
      expect(result.body.deletedAt).toBeDefined();
      expect(result.body.orderItem?.[0]?.id).toBe(orderItemModel.id);
      expect(result.body.orderItem?.[0]?.orderId).toBe(orderItemModel.orderId);
      expect(result.body.orderItem?.[0]?.productId).toBe(orderItemModel.productId);
      expect(result.body.orderItem?.[0]?.quantity).toBe(orderItemModel.quantity);
      expect(result.body.orderItem?.[0]?.unitValue).toBe(orderItemModel.unitValue);
      expect(result.body.orderItem?.[0]?.totalValue).toBe(orderItemModel.totalValue);
      expect(result.body.orderItem?.[0]?.createUserId).toBe(orderItemModel.createUserId);
      expect(result.body.orderItem?.[0]?.updateUserId).toBe(orderItemModel.updateUserId);
      expect(result.body.orderItem?.[0]?.deleteUserId).toBe(deleteUserId);
      expect(result.body.orderItem?.[0]?.createdAt).toBe(orderItemModel.createdAt);
      expect(result.body.orderItem?.[0]?.updatedAt).toBe(orderItemModel.updatedAt);
      expect(result.body.orderItem?.[0]?.deletedAt).toBeDefined();
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id',
      };

      const result = await request(app)
        .delete(`/api/orders/${requestModel.id}`)
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
