import { bootstrap } from '@/server';

describe(bootstrap.name, () => {
  test('shold log params', () => {
    const result = bootstrap(1, 1);

    expect(result).toBe(2);
  });
});
