import { makeUserRepositoryStub } from '@tests/data/stubs/repositories'
import { makeShowUserValidationStub } from '@tests/data/stubs/validations'

import { DbShowUserUseCase } from '@/data/use-cases'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'

function makeSut() {
  const userRepository = makeUserRepositoryStub()
  const showUserValidation = makeShowUserValidationStub()
  const sut = new DbShowUserUseCase(userRepository, showUserValidation.firstValidation)

  return { userRepository, showUserValidation, sut }
}

describe(DbShowUserUseCase.name, () => {
  test('Should show user and return correct values', async () => {
    const { userRepository, showUserValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue'
    }
    const sanitizedRequestModel = { ...requestModel }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    const responseModel = { ...sanitizedRequestModel }
    const existsUser = { ...responseModel }

    userRepository.findBy.mockReturnValueOnce([existsUser])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual(responseModel)
    expect(showUserValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(userRepository.findBy).toBeCalledWith([sanitizedRequestModel], true)
    expect(showUserValidation.secondValidation).toBeCalledWith({ users: [existsUser] })
  })

  test('Should throws if firstValidation throws', async () => {
    const { showUserValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue'
    }
    const error = new Error('firstValidation Error')

    showUserValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })

  test('Should throws if secondValidation throws', async () => {
    const { showUserValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue'
    }
    const error = new Error('secondValidation Error')

    showUserValidation.secondValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})
