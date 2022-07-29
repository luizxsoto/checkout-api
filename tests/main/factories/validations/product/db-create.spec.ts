import { makeValidationServiceStub } from '@tests/data/stubs/services'

import { ProductModel } from '@/domain/models'
import { CreateProductUseCase } from '@/domain/use-cases'
import { MAX_INTEGER } from '@/main/constants'
import { ValidationException } from '@/main/exceptions'
import { makeCreateProductValidation } from '@/main/factories/validations'

function makeSut() {
  const validationService = makeValidationServiceStub()
  const sut = makeCreateProductValidation(validationService)

  return { validationService, sut }
}

describe(makeCreateProductValidation.name, () => {
  describe.each([
    // name
    {
      properties: { name: undefined },
      validations: [{ field: 'name', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { name: 1 },
      validations: [{ field: 'name', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { name: 'lower' },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 255' },
      ],
    },
    {
      properties: {
        name: 'BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName Bigg',
      },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 255' },
      ],
    },
    // category
    {
      properties: { category: undefined },
      validations: [{ field: 'category', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { category: 1 },
      validations: [{ field: 'category', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { category: 'invalid_category' },
      validations: [
        {
          field: 'category',
          rule: 'in',
          message: 'This value must be in: clothes, shoes, others',
        },
      ],
    },
    // image
    {
      properties: { image: undefined },
      validations: [{ field: 'image', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { image: 1 },
      validations: [{ field: 'image', rule: 'string', message: 'This value must be a string' }],
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
              '/[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi',
          },
        },
      ],
    },
    // price
    {
      properties: { price: undefined },
      validations: [{ field: 'price', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { price: 1.2 },
      validations: [{ field: 'price', rule: 'integer', message: 'This value must be an integer' }],
    },
    {
      properties: { price: MAX_INTEGER + 1 },
      validations: [
        {
          field: 'price',
          rule: 'max',
          message: `This value must be less or equal to: ${MAX_INTEGER}`,
        },
      ],
    },
  ])(
    'Should throw ValidationException for every product invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut()

        const requestModel = {
          name: 'Any Name',
          category: 'others' as ProductModel['category'],
          image: 'any-image.com',
          price: 1000,
          ...properties,
        } as CreateProductUseCase.RequestModel

        const sutResult = await sut(requestModel).catch((e) => e)

        expect(sutResult).toStrictEqual(new ValidationException(validations))
      })
    }
  )
})
