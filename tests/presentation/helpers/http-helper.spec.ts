import { InternalException } from '@/main/exceptions';
import { created, ok, serverError } from '@/presentation/helpers';

jest.mock('@/main/exceptions/application', () => ({
  ErrorCodes: { INTERNAL: 500 },
  ApplicationException: jest.fn(() => ({ code: 500 })),
}));

describe('Http Helpers', () => {
  test('Should return correct values for ok()', () => {
    const body = { anyProp: 'anyValue' };
    const sutResult = ok(body);

    expect(sutResult).toStrictEqual({ statusCode: 200, body });
  });

  test('Should return correct values for created()', () => {
    const body = { anyProp: 'anyValue' };
    const sutResult = created(body);

    expect(sutResult).toStrictEqual({ statusCode: 201, body });
  });

  describe('Should return correct values for serverError()', () => {
    test('Case error is instanceof ApplicationException', () => {
      const error = new InternalException(new Error());
      const sutResult = serverError(error);

      expect(sutResult).toStrictEqual({ statusCode: 500, body: error });
    });
  });
});
