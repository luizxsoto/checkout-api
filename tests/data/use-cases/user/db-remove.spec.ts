import { makeUserRepositoryStub } from '@tests/data/stubs/repositories'
import { makeRemoveUserValidationStub } from '@tests/data/stubs/validations'

import { DbRemoveUserUseCase } from '@/data/use-cases'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'

function makeSut() {
  const userRepository = makeUserRepositoryStub()
  const removeUserValidation = makeRemoveUserValidationStub()
  const sut = new DbRemoveUserUseCase(
    userRepository,
    userRepository,
    removeUserValidation.firstValidation
  )

  return { userRepository, removeUserValidation, sut }
}

describe(DbRemoveUserUseCase.name, () => {
  test('Should remove user and return correct values', async () => {
    const { userRepository, removeUserValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue',
    }
    const sanitizedRequestModel = {
      ...requestModel,
    }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    const responseModel = { ...sanitizedRequestModel, deletedAt: new Date() }
    const existsUser = { ...responseModel }

    userRepository.findBy.mockReturnValueOnce([existsUser])
    userRepository.remove.mockReturnValueOnce([responseModel])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual(responseModel)
    expect(removeUserValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(userRepository.findBy).toBeCalledWith([sanitizedRequestModel], true)
    expect(removeUserValidation.secondValidation).toBeCalledWith({ users: [existsUser] })
    expect(userRepository.remove).toBeCalledWith(sanitizedRequestModel)
  })

  test('Should throws if firstValidation throws', async () => {
    const { removeUserValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue',
    }
    const error = new Error('firstValidation Error')

    removeUserValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })

  test('Should throws if secondValidation throws', async () => {
    const { removeUserValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue',
    }
    const error = new Error('secondValidation Error')

    removeUserValidation.secondValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})
