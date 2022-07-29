import { makeOrderRepositoryStub } from '@tests/data/stubs/repositories'
import { makeListOrderValidationStub } from '@tests/data/stubs/validations'

import { DbListOrderUseCase } from '@/data/use-cases'

function makeSut() {
  const orderRepository = makeOrderRepositoryStub()
  const listOrderValidation = makeListOrderValidationStub()
  const sut = new DbListOrderUseCase(orderRepository, listOrderValidation.firstValidation)

  return { orderRepository, listOrderValidation, sut }
}

describe(DbListOrderUseCase.name, () => {
  test('Should list order and return correct values', async () => {
    const { orderRepository, listOrderValidation, sut } = makeSut()

    const requestModel = {
      page: 1,
      perPage: 20,
      orderBy: 'userId' as const,
      order: 'asc' as const,
      filters: '[]',
      anyWrongProp: 'anyValue',
    }
    const sanitizedRequestModel = { ...requestModel }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    const responseModel = { ...sanitizedRequestModel }
    Reflect.deleteProperty(responseModel, 'page')
    Reflect.deleteProperty(responseModel, 'perPage')
    Reflect.deleteProperty(responseModel, 'orderBy')
    Reflect.deleteProperty(responseModel, 'order')
    Reflect.deleteProperty(responseModel, 'filters')
    const existsOrder = { ...responseModel }

    orderRepository.list.mockReturnValueOnce([existsOrder])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual([responseModel])
    expect(listOrderValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(orderRepository.list).toBeCalledWith(sanitizedRequestModel)
  })

  test('Should throws if firstValidation throws', async () => {
    const { listOrderValidation, sut } = makeSut()

    const requestModel = {
      page: 1,
      perPage: 20,
      orderBy: 'userId' as const,
      order: 'asc' as const,
      filters: '[]',
      anyWrongProp: 'anyValue',
    }
    const error = new Error('firstValidation Error')

    listOrderValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})
