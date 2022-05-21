import { resolve } from 'path';

import { hash } from 'bcrypt';
import { Express } from 'express';
import request from 'supertest';

import { knexConfig, setupApp } from '@/main/config';

let app: Express;

describe('Session Routes', () => {
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

  describe('create()', () => {
    test('Should create session and return correct values', async () => {
      const password = 'Password@123';
      const hashedPassword = await hash(password, 12);
      const requestModel = {
        id: '10000000-0000-4000-8000-000000000001',
        name: 'Any Name',
        email: 'any@email.com',
        password,
        roles: ['admin'],
        createdAt: new Date().toISOString(),
      };

      await knexConfig.table('users').insert({ ...requestModel, password: hashedPassword });

      const result = await request(app).post('/api/sessions').send(requestModel);

      expect(result.status).toBe(201);
      expect(result.body.id).toBe(requestModel.id);
      expect(result.body.name).toBe(requestModel.name);
      expect(result.body.email).toBe(requestModel.email);
      expect(result.body.password).toBe(hashedPassword);
      expect(result.body.createdAt).toBe(requestModel.createdAt);
      expect(result.body.bearerToken).toBeDefined();
    });

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = { password: 'Password@123' };

      const result = await request(app).post('/api/sessions').send(requestModel);

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
});
