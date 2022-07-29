import bcrypt from 'bcrypt'

import { BcryptCryptography } from '@/infra/cryptography'

jest.mock('bcrypt', () => ({
  async hash(): Promise<string> {
    return 'hash'
  },

  async compare(): Promise<boolean> {
    return true
  },
}))

const salt = 12
function makeSut() {
  const sut = new BcryptCryptography(salt)

  return { sut }
}

describe(BcryptCryptography.name, () => {
  describe('hash()', () => {
    test('Should call hash with correct values', async () => {
      const { sut } = makeSut()

      const hashSpy = jest.spyOn(bcrypt, 'hash')

      await sut.hash('any_value')

      expect(hashSpy).toHaveBeenCalledWith('any_value', salt)
    })

    test('Should return a valid hash on hash success', async () => {
      const { sut } = makeSut()

      const hash = await sut.hash('any_value')

      expect(hash).toBe('hash')
    })
  })

  describe('compare()', () => {
    test('Should call compare with correct values', async () => {
      const { sut } = makeSut()

      const compareSpy = jest.spyOn(bcrypt, 'compare')

      await sut.compare('any_value', 'any_hash')

      expect(compareSpy).toHaveBeenCalledWith('any_value', 'any_hash')
    })

    test('Should return true when compare succeeds', async () => {
      const { sut } = makeSut()

      const isValid = await sut.compare('any_value', 'any_hash')

      expect(isValid).toBe(true)
    })

    test('Should return false when compare fails', async () => {
      const { sut } = makeSut()

      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => false)

      const isValid = await sut.compare('any_value', 'any_hash')

      expect(isValid).toBe(false)
    })
  })
})
