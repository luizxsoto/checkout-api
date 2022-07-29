import {
  makeOrderItemRepositoryStub,
  makeOrderRepositoryStub,
  makeProductRepositoryStub,
  makeUserRepositoryStub,
} from '@tests/data/stubs/repositories'
import { makeCreateOrderValidationStub } from '@tests/data/stubs/validations'
import { makeProductModelMock, makeUserModelMock } from '@tests/domain/mocks/models'

import { DbCreateOrderUseCase } from '@/data/use-cases'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'

function makeSut() {
  const orderRepository = makeOrderRepositoryStub()
  const orderItemRepository = makeOrderItemRepositoryStub()
  const userRepository = makeUserRepositoryStub()
  const productRepository = makeProductRepositoryStub()
  const createOrderValidation = makeCreateOrderValidationStub()
  const sut = new DbCreateOrderUseCase(
    orderRepository,
    orderItemRepository,
    userRepository,
    productRepository,
    createOrderValidation.firstValidation
  )

  return {
    orderRepository,
    orderItemRepository,
    userRepository,
    productRepository,
    createOrderValidation,
    sut,
  }
}

describe(DbCreateOrderUseCase.name, () => {
  test('Should create order and return correct values', async () => {
    const {
      orderRepository,
      orderItemRepository,
      userRepository,
      productRepository,
      createOrderValidation,
      sut,
    } = makeSut()

    const requestModel = {
      userId: validUuidV4,
      anyWrongProp: 'anyValue',
      orderItems: [{ productId: validUuidV4, quantity: 1, anyWrongProp: 'anyValue' }],
    }
    const sanitizedRequestModel = {
      ...requestModel,
      orderItems: [{ ...requestModel.orderItems[0] }],
    }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    Reflect.deleteProperty(sanitizedRequestModel.orderItems[0], 'anyWrongProp')
    const orderWithValues = {
      ...sanitizedRequestModel,
      totalValue: 1000,
    }
    Reflect.deleteProperty(orderWithValues, 'orderItems')
    const orderItemWithValues = {
      ...sanitizedRequestModel.orderItems[0],
      unitValue: 1000,
      totalValue: 1000,
    }
    const orderCreated = {
      ...orderWithValues,
      id: 'any_id',
      createdAt: new Date(),
    }
    const orderItemCreated = {
      ...orderItemWithValues,
      orderId: 'any_id',
      id: 'any_id',
      createdAt: new Date(),
    }
    const responseModel = { ...orderCreated, orderItems: [orderItemCreated] }
    const user = makeUserModelMock()
    const product = makeProductModelMock()

    userRepository.findBy.mockReturnValueOnce([user])
    productRepository.findBy.mockReturnValueOnce([product])
    orderRepository.create.mockReturnValueOnce([orderCreated])
    orderItemRepository.create.mockReturnValueOnce([orderItemCreated])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual(responseModel)
    expect(createOrderValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(userRepository.findBy).toBeCalledWith([{ id: sanitizedRequestModel.userId }], true)
    expect(productRepository.findBy).toBeCalledWith([
      { id: sanitizedRequestModel.orderItems[0].productId },
    ])
    expect(createOrderValidation.secondValidation).toBeCalledWith({
      users: [user],
      products: [product],
    })
    expect(orderRepository.create).toBeCalledWith([orderWithValues])
    expect(orderItemRepository.create).toBeCalledWith([
      { ...orderItemWithValues, orderId: 'any_id' },
    ])
  })

  test('Should throws if firstValidation throws', async () => {
    const { createOrderValidation, sut } = makeSut()

    const requestModel = {
      userId: validUuidV4,
      orderItems: [{ productId: validUuidV4, quantity: 1 }],
    }
    const error = new Error('firstValidation Error')

    createOrderValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })

  test('Should throws if secondValidation throws', async () => {
    const { createOrderValidation, sut } = makeSut()

    const requestModel = {
      userId: validUuidV4,
      orderItems: [{ productId: validUuidV4, quantity: 1 }],
    }
    const error = new Error('secondValidation Error')

    createOrderValidation.secondValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})
