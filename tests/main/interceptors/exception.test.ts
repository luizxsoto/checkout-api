import { Express, Request, Response } from 'express';
import request from 'supertest';

import { setupApp } from '@/main/config/app';

let app: Express;

describe('Exception Interceptor', () => {
  beforeAll(() => {
    app = setupApp();
  });

  test('Should catch exception', async () => {
    app.post('/test_exception', (req: Request, res: Response) => {
      res.send();
    });

    await request(app)
      .post('/test_exception')
      .set('Content-Type', 'application/json')
      .send('{ "invalid": json }')
      .expect(500);
  });
});
