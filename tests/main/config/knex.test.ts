import * as knex from 'knex';

jest.mock('knex', () => ({ knex: jest.fn() }));
jest.mock('@/main/config/env', () => ({ envConfig: { dbClient: 'dbClient', dbURL: 'dbURL' } }));

describe('Knex', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should setup knex', async () => {
    const knexSpy = jest.spyOn(knex, 'knex');

    await import('@/main/config');

    expect(knexSpy).toBeCalledWith({
      client: 'dbClient',
      connection: 'dbURL',
      useNullAsDefault: true,
    });
  });
});
