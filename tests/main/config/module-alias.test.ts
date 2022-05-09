import path from 'path';

import { addAlias } from 'module-alias';

import { setupModuleAlias } from '@/main/config/module-alias';

jest.mock('module-alias', () => ({ addAlias: jest.fn() }));
jest.mock('path', () => ({ resolve: jest.fn(() => '') }));

describe('Module Alias', () => {
  const processEnvBkp = process.env;

  beforeAll(() => {
    process.env = { TS_NODE_DEV: undefined };
  });

  afterAll(() => {
    process.env = processEnvBkp;
  });

  test('Should setup for database', async () => {
    const processCwdSpy = jest.spyOn(process, 'cwd');
    processCwdSpy.mockImplementationOnce(() => 'database');
    const pathResolveSpy = jest.spyOn(path, 'resolve');
    pathResolveSpy.mockImplementationOnce(() => 'database');

    setupModuleAlias();

    expect(path.resolve).toBeCalledWith('../src');
    expect(addAlias).toBeCalledWith('@', 'database');
  });

  test('Should setup for development', async () => {
    const processCwdSpy = jest.spyOn(process, 'cwd');
    processCwdSpy.mockImplementationOnce(() => '');
    const pathResolveSpy = jest.spyOn(path, 'resolve');
    pathResolveSpy.mockImplementationOnce(() => 'development');
    process.env = { TS_NODE_DEV: 'true' };

    setupModuleAlias();

    expect(path.resolve).toBeCalledWith('src');
    expect(addAlias).toBeCalledWith('@', 'development');
  });

  test('Should setup for production', async () => {
    const processCwdSpy = jest.spyOn(process, 'cwd');
    processCwdSpy.mockImplementationOnce(() => '');
    const pathResolveSpy = jest.spyOn(path, 'resolve');
    pathResolveSpy.mockImplementationOnce(() => 'production');
    process.env = { TS_NODE_DEV: undefined };

    setupModuleAlias();

    expect(path.resolve).toBeCalledWith('dist/src');
    expect(addAlias).toBeCalledWith('@', 'production');
  });
});
