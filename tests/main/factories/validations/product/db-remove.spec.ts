import { makeValidationServiceStub } from '@tests/data/stubs/services'
import { makeProductModelMock } from '@tests/domain/mocks/models'

import { RemoveProductUseCase } from '@/domain/use-cases'
import { ValidationException } from '@/main/exceptions'
import { makeRemoveProductValidation } from '@/main/factories/validations'

const existingProduct = makeProductModelMock()
const nonExistentId = '00000000-0000-4000-8000-000000000002'

function makeSut() {
  const validationService = makeValidationServiceStub()
  const sut = makeRemoveProductValidation(validationService)

  return { validationService, sut }
}

describe(makeRemoveProductValidation.name, () => {
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
  ])(
    'Should throw ValidationException for every product invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut()

        const requestModel = { ...properties } as RemoveProductUseCase.RequestModel

        let sutResult = await sut(requestModel).catch((e) => e)

        if (typeof sutResult === 'function') {
          sutResult = await sutResult({ products: [existingProduct] }).catch((e: unknown) => e)
        }

        expect(sutResult).toStrictEqual(new ValidationException(validations))
      })
    }
  )
})
