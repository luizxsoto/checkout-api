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
    await request(app)
      .post('/api/customers')
      .send({ name: 'Any Name', email: 'any@email.com' })
      .expect(201);
  });
});
