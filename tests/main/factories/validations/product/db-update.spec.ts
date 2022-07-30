import { makeValidationServiceStub } from '@tests/data/stubs/services'
import { makeProductModelMock } from '@tests/domain/mocks/models'

import { ProductModel } from '@/domain/models'
import { UpdateProductUseCase } from '@/domain/use-cases'
import { MAX_INTEGER } from '@/main/constants'
import { ValidationException } from '@/main/exceptions'
import { makeUpdateProductValidation } from '@/main/factories/validations'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'
const nonExistentId = '00000000-0000-4000-8000-000000000002'
const existingProduct = makeProductModelMock()

function makeSut() {
  const validationService = makeValidationServiceStub()
  const sut = makeUpdateProductValidation(validationService)

  return { validationService, sut }
}

describe(makeUpdateProductValidation.name, () => {
  describe.each([
    // id
    {
      properties: { id: undefined },
      validations: [{ field: 'id', rule: 'required', message: 'This value is required' }]
    },
    {
      properties: { id: 1 },
      validations: [{ field: 'id', rule: 'string', message: 'This value must be a string' }]
    },
    {
      properties: { id: 'invalid_uuid' },
      validations: [
        {
          field: 'id',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
          details: {
            pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i'
          }
        }
      ]
    },
    {
      properties: { id: nonExistentId },
      validations: [{ field: 'id', rule: 'exists', message: 'This value was not found' }]
    },
    // name
    {
      properties: { name: 1 },
      validations: [{ field: 'name', rule: 'string', message: 'This value must be a string' }]
    },
    {
      properties: { name: 'lower' },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 255' }
      ]
    },
    {
      properties: {
        name: 'BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName Bigg'
      },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 255' }
      ]
    },
    // category
    {
      properties: { category: 1 },
      validations: [{ field: 'category', rule: 'string', message: 'This value must be a string' }]
    },
    {
      properties: { category: 'invalid_category' },
      validations: [
        {
          field: 'category',
          rule: 'in',
          message: 'This value must be in: clothes, shoes, others'
        }
      ]
    },
    // image
    {
      properties: { image: 1 },
      validations: [{ field: 'image', rule: 'string', message: 'This value must be a string' }]
    },
    {
      properties: { image: 'invalid_url' },
      validations: [
        {
          field: 'image',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: url',
          details: {
            pattern:
              '/[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi'
          }
        }
      ]
    },
    // price
    {
      properties: { price: 1.2 },
      validations: [{ field: 'price', rule: 'integer', message: 'This value must be an integer' }]
    },
    {
      properties: { price: MAX_INTEGER + 1 },
      validations: [
        {
          field: 'price',
          rule: 'max',
          message: `This value must be less or equal to: ${MAX_INTEGER}`
        }
      ]
    }
  ])(
    'Should throw ValidationException for every product invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut()

        const requestModel = {
          id: validUuidV4,
          name: 'Any Name',
          category: 'others' as ProductModel['category'],
          image: 'any-image.com',
          price: 1000,
          ...properties
        } as UpdateProductUseCase.RequestModel

        let sutResult = await sut(requestModel).catch((e) => e)

        if (typeof sutResult === 'function') {
          sutResult = await sutResult({ products: [existingProduct] }).catch((e: unknown) => e)
        }

        expect(sutResult).toStrictEqual(new ValidationException(validations))
      })
    }
  )
})
