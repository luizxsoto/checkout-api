import { makeOrderRepositoryStub, makeUserRepositoryStub } from '@tests/data/stubs/repositories'
import { makeUpdateOrderValidationStub } from '@tests/data/stubs/validations'
import { makeUserModelMock } from '@tests/domain/mocks/models'

import { DbUpdateOrderUseCase } from '@/data/use-cases'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'

function makeSut() {
  const orderRepository = makeOrderRepositoryStub()
  const userRepository = makeUserRepositoryStub()
  const updateOrderValidation = makeUpdateOrderValidationStub()
  const sut = new DbUpdateOrderUseCase(
    orderRepository,
    orderRepository,
    userRepository,
    updateOrderValidation.firstValidation
  )

  return { orderRepository, userRepository, updateOrderValidation, sut }
}

describe(DbUpdateOrderUseCase.name, () => {
  test('Should update order and return correct values', async () => {
    const { orderRepository, userRepository, updateOrderValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      userId: validUuidV4,
      anyWrongProp: 'anyValue',
    }
    const sanitizedRequestModel = {
      ...requestModel,
    }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    const responseModel = { ...sanitizedRequestModel, updatedAt: new Date() }
    const existsOrder = { ...responseModel }
    const existsUser = makeUserModelMock()

    orderRepository.findBy.mockReturnValueOnce([existsOrder])
    userRepository.findBy.mockReturnValueOnce([existsUser])
    orderRepository.update.mockReturnValueOnce([responseModel])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual(responseModel)
    expect(updateOrderValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(orderRepository.findBy).toBeCalledWith([{ id: sanitizedRequestModel.id }])
    expect(userRepository.findBy).toBeCalledWith([{ id: sanitizedRequestModel.userId }], true)
    expect(updateOrderValidation.secondValidation).toBeCalledWith({
      orders: [existsOrder],
      users: [existsUser],
    })
    expect(orderRepository.update).toBeCalledWith(
      { id: sanitizedRequestModel.id },
      sanitizedRequestModel
    )
  })

  test('Should throws if firstValidation throws', async () => {
    const { updateOrderValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      userId: validUuidV4,
      orderItems: [{ productId: validUuidV4, quantity: 1 }],
      anyWrongProp: 'anyValue',
    }
    const error = new Error('firstValidation Error')

    updateOrderValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })

  test('Should throws if secondValidation throws', async () => {
    const { updateOrderValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      userId: validUuidV4,
      orderItems: [{ productId: validUuidV4, quantity: 1 }],
      anyWrongProp: 'anyValue',
    }
    const error = new Error('secondValidation Error')

    updateOrderValidation.secondValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})
