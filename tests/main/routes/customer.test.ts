import { resolve } from 'path';

import { Express } from 'express';
import request from 'supertest';

import { knexConfig, setupApp } from '@/main/config';

let app: Express;

describe('Customer Routes', () => {
  beforeAll(async () => {
    app = setupApp();

    await knexConfig.migrate
      .latest({ directory: resolve('database/migrations') })
      .catch((error) => console.error('knexConfig.migrate', error));
  });

  afterAll(async () => {
    await knexConfig.destroy();
  });

  test('Should create customer and return correct values', async () => {
    const requestModel = { name: 'Any Name', email: 'any@email.com' };

    const result = await request(app).post('/api/customers').send(requestModel);

    expect(result.status).toBe(201);
    expect(result.body.name).toBe(requestModel.name);
    expect(result.body.email).toBe(requestModel.email);
    expect(result.body.id).toBeDefined();
  });

  test('Should return a correct body validation error if some prop is invalid', async () => {
    const requestModel = { name: 'Any Name' };

    const result = await request(app).post('/api/customers').send(requestModel);

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
