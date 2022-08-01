import { makeOrderRepositoryStub } from '@tests/data/stubs/repositories'
import { makeListOrderValidationStub } from '@tests/data/stubs/validations'
import { makeSessionModelMock } from '@tests/domain/mocks/models'

import { DbListOrderUseCase } from '@/data/use-cases'
import { SessionModel } from '@/domain/models'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'

function makeSut(session?: SessionModel) {
  const orderRepository = makeOrderRepositoryStub()
  const listOrderValidation = makeListOrderValidationStub()
  const sut = new DbListOrderUseCase(
    orderRepository,
    listOrderValidation.firstValidation,
    session ?? makeSessionModelMock()
  )

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
      anyWrongProp: 'anyValue'
    }
    const sanitizedRequestModel = { ...requestModel }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    const responseModel = { ...sanitizedRequestModel }
    Reflect.deleteProperty(responseModel, 'page')
    Reflect.deleteProperty(responseModel, 'perPage')
    Reflect.deleteProperty(responseModel, 'orderBy')
    Reflect.deleteProperty(responseModel, 'order')
    const existsOrder = { ...responseModel }

    orderRepository.list.mockReturnValueOnce([existsOrder])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual([responseModel])
    expect(listOrderValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(orderRepository.list).toBeCalledWith({ ...sanitizedRequestModel, filters: '[]' })
  })

  test('Should list order filtering session userId if have no rolesCanSeeAllOrders', async () => {
    const userId = validUuidV4
    const { orderRepository, sut } = makeSut(makeSessionModelMock({ userId, roles: [] }))

    const sanitizedRequestModel = { filters: '[]' }
    const responseModel = { ...sanitizedRequestModel }
    Reflect.deleteProperty(responseModel, 'filters')
    const existsOrder = { ...responseModel }

    orderRepository.list.mockReturnValueOnce([existsOrder])

    await sut.execute(sanitizedRequestModel)

    expect(orderRepository.list).toBeCalledWith({
      ...sanitizedRequestModel,
      filters: JSON.stringify([
        '&',
        ['=', 'userId', userId],
        JSON.parse(sanitizedRequestModel.filters)
      ])
    })
  })

  test('Should throws if firstValidation throws', async () => {
    const { listOrderValidation, sut } = makeSut()

    const requestModel = {
      page: 1,
      perPage: 20,
      orderBy: 'userId' as const,
      order: 'asc' as const,
      filters: '[]',
      anyWrongProp: 'anyValue'
    }
    const error = new Error('firstValidation Error')

    listOrderValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})
