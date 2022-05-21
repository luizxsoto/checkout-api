import { Request, Response } from 'express';

import { adaptRoute } from '@/main/adapters';

const mockErrorBody = { error: { message: 'error message' } };

jest.mock('@/presentation/helpers/http-helper', () => ({
  serverError: jest.fn(() => ({ statusCode: 500, body: mockErrorBody })),
}));

function makeSut() {
  const handle = jest.fn(() => Promise.resolve({ statusCode: 200, body: {} }));
  const sut = adaptRoute(() => ({ handle }));

  return { handle, sut };
}

describe('Express adaptRoute', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should call controller with body / params / query and return correct values', async () => {
    const { handle, sut } = makeSut();

    const request = {
      body: { bodyProp: 'any_body' },
      params: { paramsProp: 'any_params' },
      query: { queryProp: 'any_query' },
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    handle.mockImplementationOnce(() =>
      Promise.resolve({ statusCode: 200, body: { id: 'any_id' } }),
    );

    const sutResult = await sut(request as unknown as Request, response as unknown as Response);

    expect(handle).toBeCalledWith({ ...request.body, ...request.params, ...request.query });
    expect(response.status).toBeCalledWith(200);
    expect(response.json).toBeCalledWith({ id: 'any_id' });
    expect(sutResult).toBeUndefined();
  });

  test('Should not throw if controller throws', async () => {
    const { handle, sut } = makeSut();

    const request = {};
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    handle.mockImplementationOnce(() => {
      throw new Error();
    });

    const sutResult = await sut(request as unknown as Request, response as unknown as Response);

    expect(response.status).toBeCalledWith(500);
    expect(response.json).toBeCalledWith(mockErrorBody);
    expect(sutResult).toBeUndefined();
  });
});
