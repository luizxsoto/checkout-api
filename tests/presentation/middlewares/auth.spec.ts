import { makeSessionModelMock } from '@tests/domain/mocks/models'
import { makeDecrypterCryptographyStub } from '@tests/presentation/stubs/cryptography'

import { Roles } from '@/domain/models'
import { InvalidCredentials, InvalidPermissions } from '@/main/exceptions'
import { AuthMiddleware } from '@/presentation/middlewares'

function makeSut(roles?: Roles[]) {
  const decrypter = makeDecrypterCryptographyStub()
  const sut = new AuthMiddleware(decrypter, roles ?? [])

  return { decrypter, sut }
}

describe(AuthMiddleware.name, () => {
  test('Should decrypt the bearerToken return user', async () => {
    const { decrypter, sut } = makeSut()

    const decryptResult = makeSessionModelMock()
    decrypter.decrypt.mockReturnValueOnce(Promise.resolve(decryptResult))

    const request = { bearerToken: 'Bearer valid_bearerToken' }
    const sutResult = await sut.handle(request)

    expect(decrypter.decrypt).toBeCalledWith(request.bearerToken.replace('Bearer ', ''))

    expect(sutResult).toStrictEqual({ session: { ...decryptResult } })
  })

  test('Should throw InvalidCredentials if no bearerToken was informed', async () => {
    const { sut } = makeSut()

    const request = { bearerToken: '' }
    const sutResult = await sut.handle(request).catch((e) => e)

    expect(sutResult).toStrictEqual(new InvalidCredentials())
  })

  test('Should throw InvalidCredentials if an invalid bearerToken was informed', async () => {
    const { sut } = makeSut()

    const request = { bearerToken: 'invalid_bearerToken' }
    const sutResult = await sut.handle(request).catch((e) => e)

    expect(sutResult).toStrictEqual(new InvalidCredentials())
  })

  test('Should throw InvalidCredentials if decryptResult is invalid', async () => {
    const { decrypter, sut } = makeSut()

    const decryptResult = { invalid: 'result' }
    decrypter.decrypt.mockReturnValueOnce(Promise.resolve(decryptResult))

    const request = { bearerToken: 'Bearer valid_bearerToken' }
    const sutResult = await sut.handle(request).catch((e) => e)

    expect(sutResult).toStrictEqual(new InvalidCredentials())
  })

  test('Should throw InvalidPermissions if an required role was not informed', async () => {
    const { decrypter, sut } = makeSut(['admin'])

    const decryptResult = makeSessionModelMock({ roles: [] })
    decrypter.decrypt.mockReturnValueOnce(Promise.resolve(decryptResult))

    const request = { bearerToken: 'Bearer valid_bearerToken' }
    const sutResult = await sut.handle(request).catch((e) => e)

    expect(sutResult).toStrictEqual(new InvalidPermissions())
  })
})
