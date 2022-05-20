import { makeUserModelMock } from '@tests/domain/mocks/models';

export function makeCreateSessionUseCaseStub() {
  return {
    execute: jest.fn(() =>
      Promise.resolve({ ...makeUserModelMock(), accessToken: 'any_accessToken' }),
    ),
  };
}
