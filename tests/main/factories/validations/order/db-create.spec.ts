import { makeValidationServiceStub } from '@tests/data/stubs/services'
import { makeProductModelMock, makeUserModelMock } from '@tests/domain/mocks/models'

import { CreateOrderUseCase } from '@/domain/use-cases'
import { MAX_INTEGER } from '@/main/constants'
import { ValidationException } from '@/main/exceptions'
import { makeCreateOrderValidation } from '@/main/factories/validations'

const existingUser = makeUserModelMock()
const existingProduct = makeProductModelMock()
const validUuidV4 = '00000000-0000-4000-8000-000000000001'
const nonExistentId = '00000000-0000-4000-8000-000000000002'

function makeSut() {
  const validationService = makeValidationServiceStub()
  const sut = makeCreateOrderValidation(validationService)

  return { validationService, sut }
}

describe(makeCreateOrderValidation.name, () => {
  describe.each([
    // userId
    {
      properties: { userId: undefined },
      validations: [{ field: 'userId', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { userId: 1 },
      validations: [{ field: 'userId', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { userId: 'invalid_id' },
      validations: [
        {
          field: 'userId',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
          details: {
            pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i',
          },
        },
      ],
    },
    {
      properties: { userId: nonExistentId },
      validations: [{ field: 'userId', rule: 'exists', message: 'This value was not found' }],
    },
    // orderItems
    {
      properties: { orderItems: undefined },
      validations: [{ field: 'orderItems', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: {
        orderItems: [
          { productId: validUuidV4, quantity: 1 },
          { productId: validUuidV4, quantity: 1 },
        ],
      },
      validations: [
        {
          field: 'orderItems',
          rule: 'distinct',
          message: 'This value cannot have duplicate items by: productId',
        },
      ],
    },
    // orderItems.0.productId
    {
      properties: { orderItems: [{ productId: undefined, quantity: 1 }] },
      validations: [
        { field: 'orderItems.0.productId', rule: 'required', message: 'This value is required' },
      ],
    },
    {
      properties: { orderItems: [{ productId: 1, quantity: 1 }] },
      validations: [
        { field: 'orderItems.0.productId', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { orderItems: [{ productId: 'invalid_id', quantity: 1 }] },
      validations: [
        {
          field: 'orderItems.0.productId',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
          details: {
            pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i',
          },
        },
      ],
    },
    {
      properties: { orderItems: [{ productId: nonExistentId, quantity: 1 }] },
      validations: [
        { field: 'orderItems.0.productId', rule: 'exists', message: 'This value was not found' },
      ],
    },
    // orderItems.0.quantity
    {
      properties: { orderItems: [{ productId: validUuidV4, quantity: undefined }] },
      validations: [
        { field: 'orderItems.0.quantity', rule: 'required', message: 'This value is required' },
      ],
    },
    {
      properties: { orderItems: [{ productId: validUuidV4, quantity: 1.2 }] },
      validations: [
        {
          field: 'orderItems.0.quantity',
          rule: 'integer',
          message: 'This value must be an integer',
        },
      ],
    },
    {
      properties: { orderItems: [{ productId: validUuidV4, quantity: 0 }] },
      validations: [
        {
          field: 'orderItems.0.quantity',
          rule: 'min',
          message: 'This value must be bigger or equal to: 1',
        },
      ],
    },
    {
      properties: { orderItems: [{ productId: validUuidV4, quantity: MAX_INTEGER + 1 }] },
      validations: [
        {
          field: 'orderItems.0.quantity',
          rule: 'max',
          message: `This value must be less or equal to: ${MAX_INTEGER}`,
        },
      ],
    },
  ])(
    'Should throw ValidationException for every order invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut()

        const requestModel = {
          userId: validUuidV4,
          orderItems: [{ productId: validUuidV4, quantity: 1 }],
          ...properties,
        } as CreateOrderUseCase.RequestModel

        let sutResult = await sut(requestModel).catch((e) => e)

        if (typeof sutResult === 'function') {
          sutResult = await sutResult({ users: [existingUser], products: [existingProduct] }).catch(
            (e: unknown) => e
          )
        }

        expect(sutResult).toStrictEqual(new ValidationException(validations))
      })
    }
  )
})
