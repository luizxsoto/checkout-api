import { Request, Response } from 'express';

import { adaptRoute } from '@/main/adapters';

jest.mock('@/presentation/helpers/http-helper', () => ({
  serverError: jest.fn(() => ({ statusCode: 500, body: { error: { message: 'error message' } } })),
}));

function makeSut() {
  const handle = jest.fn(() => Promise.resolve({ statusCode: 200, body: {} }));
  const sut = adaptRoute({ handle });

  return { handle, sut };
}

describe('Express adaptRoute', () => {
  test('Should call controller with params / body and return correct values', async () => {
    const { handle, sut } = makeSut();

    const request = {
      body: { bodyProp: 'any_body' },
      params: { paramsProp: 'any_params' },
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    handle.mockImplementationOnce(() =>
      Promise.resolve({ statusCode: 200, body: { id: 'any_id' } }),
    );

    const sutResult = await sut(request as unknown as Request, response as unknown as Response);

    expect(handle).toBeCalledWith({ ...request.body, ...request.params });
    expect(response.status).toBeCalledWith(200);
    expect(response.json).toBeCalledWith({ id: 'any_id' });
    expect(sutResult).toBeUndefined();
  });
});
