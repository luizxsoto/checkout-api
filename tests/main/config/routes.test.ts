import { Express } from 'express';

import { setupRoutes } from '@/main/config/routes';
import * as routes from '@/main/routes';

jest.mock('express', () => ({ Express: {}, Router: jest.fn(() => jest.fn()), json: jest.fn() }));
jest.mock('@/main/routes', () => ({ customerRoutes: jest.fn() }));

function makeSut() {
  const express = { use: jest.fn() };
  const sut = setupRoutes;

  return { express, sut };
}

describe('Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should setup routes', async () => {
    const { express, sut } = makeSut();

    const routeSpy = jest.spyOn(routes, 'customerRoutes');
    sut(express as unknown as Express);

    expect(express.use).toBeCalledWith('/api', expect.any(Function));
    expect(routeSpy).toBeCalledWith(expect.any(Function));
  });
});
