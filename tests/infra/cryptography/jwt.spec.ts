import jwt from 'jsonwebtoken'

import { JwtCryptography } from '@/infra/cryptography'

jest.mock('jsonwebtoken', () => ({
  async sign(): Promise<string> {
    return 'any_token'
  },

  async verify(): Promise<string> {
    return 'any_value'
  }
}))

function makeSut() {
  const sut = new JwtCryptography('secret')

  return { sut }
}

describe(JwtCryptography.name, () => {
  describe('encrypt()', () => {
    test('Should call sign with correct values', async () => {
      const { sut } = makeSut()

      const signSpy = jest.spyOn(jwt, 'sign')

      await sut.encrypt({ id: 'any_id' })

      expect(signSpy).toHaveBeenCalledWith({ id: 'any_id' }, 'secret')
    })

    test('Should return a token on sign success', async () => {
      const { sut } = makeSut()

      const bearerToken = await sut.encrypt({ id: 'any_id' })

      expect(bearerToken).toBe('any_token')
    })
  })

  describe('decrypt()', () => {
    test('Should call verify with correct values', async () => {
      const { sut } = makeSut()

      const verifySpy = jest.spyOn(jwt, 'verify')

      await sut.decrypt('any_token')

      expect(verifySpy).toHaveBeenCalledWith('any_token', 'secret')
    })

    test('Should return a value on verify success', async () => {
      const { sut } = makeSut()

      const value = await sut.decrypt('any_token')

      expect(value).toBe('any_value')
    })
  })
})
