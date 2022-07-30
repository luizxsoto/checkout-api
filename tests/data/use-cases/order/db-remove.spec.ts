import {
  makeOrderItemRepositoryStub,
  makeOrderRepositoryStub
} from '@tests/data/stubs/repositories'
import { makeRemoveOrderValidationStub } from '@tests/data/stubs/validations'

import { DbRemoveOrderUseCase } from '@/data/use-cases'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'

function makeSut() {
  const orderRepository = makeOrderRepositoryStub()
  const orderItemRepository = makeOrderItemRepositoryStub()
  const removeOrderValidation = makeRemoveOrderValidationStub()
  const sut = new DbRemoveOrderUseCase(
    orderRepository,
    orderItemRepository,
    orderRepository,
    removeOrderValidation.firstValidation
  )

  return { orderRepository, orderItemRepository, removeOrderValidation, sut }
}

describe(DbRemoveOrderUseCase.name, () => {
  test('Should remove order and return correct values', async () => {
    const { orderRepository, orderItemRepository, removeOrderValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue'
    }
    const sanitizedRequestModel = {
      ...requestModel
    }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    const orderResponseModel = { ...sanitizedRequestModel, deletedAt: new Date() }
    const orderItemResponseModel = { ...orderResponseModel }
    const existsOrder = { ...orderResponseModel }
    const responseModel = { ...orderResponseModel, orderItems: [orderItemResponseModel] }

    orderRepository.findBy.mockReturnValueOnce([existsOrder])
    orderRepository.remove.mockReturnValueOnce([orderResponseModel])
    orderItemRepository.remove.mockReturnValueOnce([orderItemResponseModel])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual(responseModel)
    expect(removeOrderValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(orderRepository.findBy).toBeCalledWith([sanitizedRequestModel])
    expect(removeOrderValidation.secondValidation).toBeCalledWith({ orders: [existsOrder] })
    expect(orderRepository.remove).toBeCalledWith(sanitizedRequestModel)
    expect(orderItemRepository.remove).toBeCalledWith({ orderId: sanitizedRequestModel.id })
  })

  test('Should throws if firstValidation throws', async () => {
    const { removeOrderValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue'
    }
    const error = new Error('firstValidation Error')

    removeOrderValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })

  test('Should throws if secondValidation throws', async () => {
    const { removeOrderValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue'
    }
    const error = new Error('secondValidation Error')

    removeOrderValidation.secondValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})
