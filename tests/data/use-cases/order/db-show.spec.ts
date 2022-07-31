import {
  makeOrderItemRepositoryStub,
  makeOrderRepositoryStub
} from '@tests/data/stubs/repositories'
import { makeShowOrderValidationStub } from '@tests/data/stubs/validations'
import { makeSessionModelMock } from '@tests/domain/mocks/models'

import { DbShowOrderUseCase } from '@/data/use-cases'
import { SessionModel } from '@/domain/models'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'

function makeSut(session?: SessionModel) {
  const orderRepository = makeOrderRepositoryStub()
  const orderItemRepository = makeOrderItemRepositoryStub()
  const showOrderValidation = makeShowOrderValidationStub()
  const sut = new DbShowOrderUseCase(
    orderRepository,
    orderItemRepository,
    showOrderValidation.firstValidation,
    session || makeSessionModelMock()
  )

  return { orderRepository, orderItemRepository, showOrderValidation, sut }
}

describe(DbShowOrderUseCase.name, () => {
  test('Should show order and return correct values', async () => {
    const { orderRepository, orderItemRepository, showOrderValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue'
    }
    const sanitizedRequestModel = { ...requestModel }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    const existsOrder = { ...sanitizedRequestModel }
    const existsOrderItem = { ...sanitizedRequestModel }
    const responseModel = { ...existsOrder, orderItems: [existsOrderItem] }

    orderRepository.findBy.mockReturnValueOnce([existsOrder])
    orderItemRepository.findBy.mockReturnValueOnce([existsOrderItem])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual(responseModel)
    expect(showOrderValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(orderRepository.findBy).toBeCalledWith([sanitizedRequestModel])
    expect(showOrderValidation.secondValidation).toBeCalledWith({ orders: [existsOrder] })
    expect(orderItemRepository.findBy).toBeCalledWith([{ orderId: sanitizedRequestModel.id }])
  })

  test('Should show order filtering session userId if have no rolesCanSeeAllOrders', async () => {
    const userId = validUuidV4
    const { orderRepository, sut } = makeSut(makeSessionModelMock({ userId, roles: [] }))

    const sanitizedRequestModel = { id: validUuidV4 }

    await sut.execute(sanitizedRequestModel)

    expect(orderRepository.findBy).toBeCalledWith([sanitizedRequestModel, { userId }])
  })

  test('Should throws if firstValidation throws', async () => {
    const { showOrderValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue'
    }
    const error = new Error('firstValidation Error')

    showOrderValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })

  test('Should throws if secondValidation throws', async () => {
    const { showOrderValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue'
    }
    const error = new Error('secondValidation Error')

    showOrderValidation.secondValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})
