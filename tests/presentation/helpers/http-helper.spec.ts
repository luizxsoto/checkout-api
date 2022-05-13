import { created, ok } from '@/presentation/helpers';

jest.mock('@/main/exceptions/application', () => ({
  ApplicationException: jest.fn(),
}));

describe('Http Helpers', () => {
  test('ok()', () => {
    const body = { anyProp: 'anyValue' };
    const sutResult = ok(body);

    expect(sutResult).toStrictEqual({ statusCode: 200, body });
  });

  test('created()', () => {
    const body = { anyProp: 'anyValue' };
    const sutResult = created(body);

    expect(sutResult).toStrictEqual({ statusCode: 201, body });
  });
});
