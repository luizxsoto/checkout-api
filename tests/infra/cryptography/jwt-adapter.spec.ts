import jwt from 'jsonwebtoken';

import { JwtCryptography } from '@/infra/cryptography';

jest.mock('jsonwebtoken', () => ({
  async sign(): Promise<string> {
    return 'any_token';
  },
}));

function makeSut() {
  const sut = new JwtCryptography('secret');

  return { sut };
}

describe(JwtCryptography.name, () => {
  describe('encrypt()', () => {
    test('Should call sign with correct values', async () => {
      const { sut } = makeSut();

      const signSpy = jest.spyOn(jwt, 'sign');

      await sut.encrypt('any_id');

      expect(signSpy).toHaveBeenCalledWith({ id: 'any_id' }, 'secret');
    });

    test('Should return a token on sign success', async () => {
      const { sut } = makeSut();

      const accessToken = await sut.encrypt('any_id');

      expect(accessToken).toBe('any_token');
    });
  });
});
