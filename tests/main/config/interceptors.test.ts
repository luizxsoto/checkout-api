import { Express } from 'express';

import { setupInterceptors } from '@/main/config';
import { exception } from '@/main/interceptors';

function makeSut() {
  const express = { use: jest.fn() };
  const sut = setupInterceptors;

  return { express, sut };
}

describe('Interceptors', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should setup interceptors', () => {
    const { express, sut } = makeSut();

    sut(express as unknown as Express);

    expect(express.use).toBeCalledTimes(1);
    expect(express.use).toBeCalledWith(exception);
  });
});
