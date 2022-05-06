import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  cache: false,
  verbose: true,
  testRegex: '.*\\.(spec|test)\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/domain/**',
    '!<rootDir>/src/main/server.ts',
    '!<rootDir>/src/presentation/dtos/**',
    '!<rootDir>/src/**/contracts/**',
    '!<rootDir>/src/**/exceptions/**',
  ],
  coverageDirectory: './coverage',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  moduleNameMapper: {
    '^@tests/(.*)': ['<rootDir>/tests/$1'],
    '^@/(.*)': ['<rootDir>/src/$1'],
  },
};

// eslint-disable-next-line import/no-default-export
export default config;
