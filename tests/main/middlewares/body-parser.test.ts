import { Express } from 'express';
import request from 'supertest';

import { setupApp } from '@/main/config';

let app: Express;

describe('Body Parser Middleware', () => {
  beforeAll(() => {
    app = setupApp();
  });

  test('Should parse body as json', async () => {
    app.post('/test_body_parser', (req, res) => {
      res.send(req.body);
    });

    await request(app)
      .post('/test_body_parser')
      .send({ anyProp: 'anyProp' })
      .expect({ anyProp: 'anyProp' });
  });
});
