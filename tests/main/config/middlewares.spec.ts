import { Express } from 'express';

import { setupMiddlewares } from '@/main/config';

jest.mock('@/main/middlewares/body-parser', () => ({ bodyParser: jest.fn() }));
jest.mock('@/main/middlewares/content-type', () => ({ contentType: jest.fn() }));
jest.mock('@/main/middlewares/cors', () => ({ cors: jest.fn() }));

function makeSut() {
  const express = { use: jest.fn() };
  const sut = setupMiddlewares;

  return { express, sut };
}

describe('Middlewares', () => {
  test('Should setup middlewares', () => {
    const { express, sut } = makeSut();

    sut(express as unknown as Express);

    expect(express.use).toBeCalledTimes(3);
  });
});
