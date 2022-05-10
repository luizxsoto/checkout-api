import * as express from 'express';

import { setupApp } from '@/main/config';
import * as middlewares from '@/main/config/middlewares';
import * as routes from '@/main/config/routes';

const mockExpressApp = {} as express.Express;
jest.mock('express', () => () => mockExpressApp);
jest.mock('@/main/config/middlewares', () => ({ setupMiddlewares: jest.fn() }));
jest.mock('@/main/config/routes', () => ({ setupRoutes: jest.fn() }));

function makeSut() {
  const sut = setupApp;

  return { sut };
}

describe('App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should setup app', () => {
    const { sut } = makeSut();

    const setupMiddlewaresSpy = jest.spyOn(middlewares, 'setupMiddlewares');
    const setupRoutesSpy = jest.spyOn(routes, 'setupRoutes');
    sut();

    expect(setupMiddlewaresSpy).toBeCalledWith(mockExpressApp);
    expect(setupRoutesSpy).toBeCalledWith(mockExpressApp);
  });
});
