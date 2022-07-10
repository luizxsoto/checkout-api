import { Request, Response } from 'express';

import { adaptMiddleware } from '@/main/adapters';

function makeSut() {
  const handle = jest.fn(() => Promise.resolve({}));
  const sut = adaptMiddleware({ handle });

  return { handle, sut };
}

describe('Express adaptMiddleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should call middleware with headers and return correct values', async () => {
    const { handle, sut } = makeSut();

    const request = {
      headers: { headersProp: 'any_headers', authorization: 'Bearer any_bearerToken' },
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    const handleMockResult = { id: 'any_id' };
    handle.mockImplementationOnce(() => Promise.resolve(handleMockResult));

    const sutResult = await sut(
      request as unknown as Request,
      response as unknown as Response,
      next,
    );

    expect(handle).toBeCalledWith({
      ...request.headers,
      bearerToken: request.headers.authorization.replace('Bearer ', ''),
    });
    expect(next).toBeCalledWith();
    expect(sutResult).toBeUndefined();
    expect(request).toStrictEqual({ ...request, ...handleMockResult });
  });

  test('Should not throw if middleware throws', async () => {
    const { handle, sut } = makeSut();

    const request = {
      headers: { headersProp: 'any_headers', authorization: 'Bearer any_bearerToken' },
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    const error = new Error();
    handle.mockImplementationOnce(() => {
      throw error;
    });

    const sutResult = await sut(
      request as unknown as Request,
      response as unknown as Response,
      next,
    );

    expect(next).toBeCalledWith(error);
    expect(sutResult).toBeUndefined();
  });
});
