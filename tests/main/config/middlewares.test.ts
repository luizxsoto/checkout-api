import { Express } from 'express';

import { setupMiddlewares } from '@/main/config';
import { bodyParser, contentType, cors } from '@/main/middlewares';

function makeSut() {
  const express = { use: jest.fn() };
  const sut = setupMiddlewares;

  return { express, sut };
}

describe('Middlewares', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should setup middlewares', () => {
    const { express, sut } = makeSut();

    sut(express as unknown as Express);

    expect(express.use).toBeCalledTimes(3);
    expect(express.use).toBeCalledWith(bodyParser);
    expect(express.use).toBeCalledWith(cors);
    expect(express.use).toBeCalledWith(contentType);
  });
});
