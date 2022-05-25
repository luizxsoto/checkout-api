import { resolve } from 'path';

import { Express } from 'express';
import request from 'supertest';

import { knexConfig, setupApp } from '@/main/config';
import { makeBearerTokenMock } from '@tests/domain/mocks/models';

let app: Express;

describe('User Routes', () => {
  beforeAll(async () => {
    app = setupApp();

    await knexConfig.migrate
      .latest({ directory: resolve('database/migrations') })
      .catch((error) => console.error('[knexConfig.migrate]', error));
  });

  afterEach(async () => {
    await knexConfig.table('users').del();
  });

  afterAll(async () => {
    await knexConfig.destroy();
  });

  describe('list()', () => {
    test('Should list user and return correct values', async () => {
      const requestModel = {
        id: '10000000-0000-4000-8000-000000000001',
        name: 'Any Name',
        email: 'any@email.com',
        password: 'hashed_password',
        roles: [],
        createdAt: new Date().toISOString(),
      };

      await knexConfig.table('users').insert(requestModel);

      const result = await request(app)
        .get(`/api/users?email=${requestModel.email}`)
        .set('authorization', await makeBearerTokenMock())
        .send();

      expect(result.status).toBe(200);
      expect(result.body[0]?.id).toBe(requestModel.id);
      expect(result.body[0]?.name).toBe(requestModel.name);
      expect(result.body[0]?.email).toBe(requestModel.email);
      expect(result.body[0]?.password).toBe(requestModel.password);
      expect(result.body[0]?.createdAt).toBe(requestModel.createdAt);
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        email: 'invalid_email',
      };

      const result = await request(app)
        .get(`/api/users?email=${requestModel.email}`)
        .set('authorization', await makeBearerTokenMock())
        .send();

      expect(result.status).toBe(400);
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'email',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: email',
          },
        ],
      });
    });
  });

  describe('show()', () => {
    test('Should show user and return correct values', async () => {
      const requestModel = {
        id: '10000000-0000-4000-8000-000000000001',
        name: 'Any Name',
        email: 'any@email.com',
        password: 'hashed_password',
        roles: [],
        createdAt: new Date().toISOString(),
      };

      await knexConfig.table('users').insert(requestModel);

      const result = await request(app)
        .get(`/api/users/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send();

      expect(result.status).toBe(200);
      expect(result.body.id).toBe(requestModel.id);
      expect(result.body.name).toBe(requestModel.name);
      expect(result.body.email).toBe(requestModel.email);
      expect(result.body.password).toBe(requestModel.password);
      expect(result.body.createdAt).toBe(requestModel.createdAt);
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id',
      };

      const result = await request(app)
        .get(`/api/users/${requestModel.id}`)
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
    test('Should create user and return correct values', async () => {
      const requestModel = {
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123',
        roles: [],
      };

      const result = await request(app)
        .post('/api/users')
        .set('authorization', await makeBearerTokenMock())
        .send(requestModel);

      expect(result.status).toBe(201);
      expect(result.body.name).toBe(requestModel.name);
      expect(result.body.email).toBe(requestModel.email);
      expect(result.body.password).toBeDefined();
      expect(result.body.id).toBeDefined();
      expect(result.body.createdAt).toBeDefined();
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        name: 'Any Name',
        password: 'Password@123',
        roles: [],
      };

      const result = await request(app)
        .post('/api/users')
        .set('authorization', await makeBearerTokenMock())
        .send(requestModel);

      expect(result.status).toBe(400);
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'email',
            rule: 'required',
            message: 'This value is required',
          },
        ],
      });
    });
  });

  describe('update()', () => {
    test('Should update user and return correct values', async () => {
      const requestModel = {
        id: '10000000-0000-4000-8000-000000000001',
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123',
        roles: [],
        createdAt: new Date().toISOString(),
      };

      await knexConfig.table('users').insert(requestModel);

      const result = await request(app)
        .put(`/api/users/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send(requestModel);

      expect(result.status).toBe(200);
      expect(result.body.id).toBe(requestModel.id);
      expect(result.body.name).toBe(requestModel.name);
      expect(result.body.email).toBe(requestModel.email);
      expect(result.body.createdAt).toBe(requestModel.createdAt);
      expect(result.body.password).toBeDefined();
      expect(result.body.updatedAt).toBeDefined();
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id',
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123',
        roles: [],
        createdAt: new Date(),
      };

      const result = await request(app)
        .put(`/api/users/${requestModel.id}`)
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
    test('Should remove user and return correct values', async () => {
      const requestModel = {
        id: '10000000-0000-4000-8000-000000000001',
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123',
        roles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await knexConfig.table('users').insert(requestModel);

      const result = await request(app)
        .delete(`/api/users/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send();

      expect(result.status).toBe(200);
      expect(result.body.id).toBe(requestModel.id);
      expect(result.body.name).toBe(requestModel.name);
      expect(result.body.email).toBe(requestModel.email);
      expect(result.body.createdAt).toBe(requestModel.createdAt);
      expect(result.body.updatedAt).toBe(requestModel.updatedAt);
      expect(result.body.password).toBeDefined();
      expect(result.body.deletedAt).toBeDefined();
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id',
      };

      const result = await request(app)
        .delete(`/api/users/${requestModel.id}`)
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
