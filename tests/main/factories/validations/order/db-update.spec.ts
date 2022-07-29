import { makeValidationServiceStub } from '@tests/data/stubs/services'
import { makeOrderModelMock, makeUserModelMock } from '@tests/domain/mocks/models'

import { UpdateOrderUseCase } from '@/domain/use-cases'
import { ValidationException } from '@/main/exceptions'
import { makeUpdateOrderValidation } from '@/main/factories/validations'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'
const nonExistentId = '00000000-0000-4000-8000-000000000002'
const existingOrder = makeOrderModelMock()
const existingUser = makeUserModelMock()

function makeSut() {
  const validationService = makeValidationServiceStub()
  const sut = makeUpdateOrderValidation(validationService)

  return { validationService, sut }
}

describe(makeUpdateOrderValidation.name, () => {
  describe.each([
    // id
    {
      properties: { id: undefined },
      validations: [{ field: 'id', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { id: 1 },
      validations: [{ field: 'id', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { id: 'invalid_uuid' },
      validations: [
        {
          field: 'id',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
          details: {
            pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i',
          },
        },
      ],
    },
    {
      properties: { id: nonExistentId },
      validations: [{ field: 'id', rule: 'exists', message: 'This value was not found' }],
    },
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
      properties: { userId: 'invalid_uuid' },
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
  ])(
    'Should throw ValidationException for every order invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut()

        const requestModel = {
          id: validUuidV4,
          userId: validUuidV4,
          ...properties,
        } as UpdateOrderUseCase.RequestModel

        let sutResult = await sut(requestModel).catch((e) => e)

        if (typeof sutResult === 'function') {
          sutResult = await sutResult({ orders: [existingOrder], users: [existingUser] }).catch(
            (e: unknown) => e
          )
        }

        expect(sutResult).toStrictEqual(new ValidationException(validations))
      })
    }
  )
})
