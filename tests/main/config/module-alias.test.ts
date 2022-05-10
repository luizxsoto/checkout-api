import path from 'path';

import { addAlias } from 'module-alias';

import { setupModuleAlias } from '@/main/config/module-alias';

jest.mock('module-alias', () => ({ addAlias: jest.fn() }));
jest.mock('path', () => ({ resolve: jest.fn(() => '') }));

function makeSut() {
  const sut = setupModuleAlias;

  return { sut };
}

describe('Module Alias', () => {
  const processEnvBkp = process.env;

  beforeAll(() => {
    process.env = { TS_NODE_DEV: undefined };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = processEnvBkp;
  });

  test('Should setup for database', async () => {
    const { sut } = makeSut();
    const processCwdSpy = jest.spyOn(process, 'cwd');
    processCwdSpy.mockImplementationOnce(() => 'database');
    const pathResolveSpy = jest.spyOn(path, 'resolve');
    pathResolveSpy.mockImplementationOnce(() => 'database');

    sut();

    expect(path.resolve).toBeCalledWith('../src');
    expect(addAlias).toBeCalledWith('@', 'database');
  });

  test('Should setup for development', async () => {
    const { sut } = makeSut();
    const processCwdSpy = jest.spyOn(process, 'cwd');
    processCwdSpy.mockImplementationOnce(() => '');
    const pathResolveSpy = jest.spyOn(path, 'resolve');
    pathResolveSpy.mockImplementationOnce(() => 'development');
    process.env = { TS_NODE_DEV: 'true' };

    sut();

    expect(path.resolve).toBeCalledWith('src');
    expect(addAlias).toBeCalledWith('@', 'development');
  });

  test('Should setup for production', async () => {
    const { sut } = makeSut();
    const processCwdSpy = jest.spyOn(process, 'cwd');
    processCwdSpy.mockImplementationOnce(() => '');
    const pathResolveSpy = jest.spyOn(path, 'resolve');
    pathResolveSpy.mockImplementationOnce(() => 'production');
    process.env = { TS_NODE_DEV: undefined };

    sut();

    expect(path.resolve).toBeCalledWith('dist/src');
    expect(addAlias).toBeCalledWith('@', 'production');
  });
});
