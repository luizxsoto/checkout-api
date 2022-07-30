import { makeUserRepositoryStub } from '@tests/data/stubs/repositories'
import { makeListUserValidationStub } from '@tests/data/stubs/validations'

import { DbListUserUseCase } from '@/data/use-cases'

function makeSut() {
  const userRepository = makeUserRepositoryStub()
  const listUserValidation = makeListUserValidationStub()
  const sut = new DbListUserUseCase(userRepository, listUserValidation.firstValidation)

  return { userRepository, listUserValidation, sut }
}

describe(DbListUserUseCase.name, () => {
  test('Should list user and return correct values', async () => {
    const { userRepository, listUserValidation, sut } = makeSut()

    const requestModel = {
      page: 1,
      perPage: 20,
      orderBy: 'name' as const,
      order: 'asc' as const,
      filters: '[]',
      anyWrongProp: 'anyValue'
    }
    const sanitizedRequestModel = { ...requestModel }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    const responseModel = { ...sanitizedRequestModel }
    Reflect.deleteProperty(responseModel, 'page')
    Reflect.deleteProperty(responseModel, 'perPage')
    Reflect.deleteProperty(responseModel, 'orderBy')
    Reflect.deleteProperty(responseModel, 'order')
    Reflect.deleteProperty(responseModel, 'filters')
    const existsUser = { ...responseModel }

    userRepository.list.mockReturnValueOnce([existsUser])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual([responseModel])
    expect(listUserValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(userRepository.list).toBeCalledWith(sanitizedRequestModel)
  })

  test('Should throws if firstValidation throws', async () => {
    const { listUserValidation, sut } = makeSut()

    const requestModel = {
      page: 1,
      perPage: 20,
      orderBy: 'name' as const,
      order: 'asc' as const,
      filters: '[]',
      anyWrongProp: 'anyValue'
    }
    const error = new Error('firstValidation Error')

    listUserValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})
