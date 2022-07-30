import { makeValidationServiceStub } from '@tests/data/stubs/services'

import { ListOrderUseCase } from '@/domain/use-cases'
import { MAX_INTEGER, MAX_PER_PAGE, MIN_PER_PAGE } from '@/main/constants'
import { ValidationException } from '@/main/exceptions'
import { makeListOrderValidation } from '@/main/factories/validations'

function makeSut() {
  const validationService = makeValidationServiceStub()
  const sut = makeListOrderValidation(validationService)

  return { validationService, sut }
}

describe(makeListOrderValidation.name, () => {
  describe.each([
    // page
    {
      properties: { page: 'page' },
      validations: [{ field: 'page', rule: 'integer', message: 'This value must be an integer' }]
    },
    {
      properties: { page: 0 },
      validations: [
        { field: 'page', rule: 'min', message: 'This value must be bigger or equal to: 1' }
      ]
    },
    // perPage
    {
      properties: { perPage: 'perPage' },
      validations: [{ field: 'perPage', rule: 'integer', message: 'This value must be an integer' }]
    },
    {
      properties: { perPage: MIN_PER_PAGE - 1 },
      validations: [
        { field: 'perPage', rule: 'min', message: 'This value must be bigger or equal to: 20' }
      ]
    },
    {
      properties: { perPage: MAX_PER_PAGE + 1 },
      validations: [
        { field: 'perPage', rule: 'max', message: 'This value must be less or equal to: 50' }
      ]
    },
    // orderBy
    {
      properties: { orderBy: 1 },
      validations: [{ field: 'orderBy', rule: 'string', message: 'This value must be a string' }]
    },
    {
      properties: { orderBy: 'orderBy' },
      validations: [
        {
          field: 'orderBy',
          rule: 'in',
          message: 'This value must be in: userId, totalValue, createdAt, updatedAt'
        }
      ]
    },
    // order
    {
      properties: { order: 1 },
      validations: [{ field: 'order', rule: 'string', message: 'This value must be a string' }]
    },
    {
      properties: { order: 'order' },
      validations: [{ field: 'order', rule: 'in', message: 'This value must be in: asc, desc' }]
    },
    // userId
    {
      properties: { filters: '["=", "userId", 1]' },
      validations: [
        { field: 'filters.userId.0', rule: 'string', message: 'This value must be a string' }
      ]
    },
    {
      properties: { filters: '["=", "userId", "invalid_uuid"]' },
      validations: [
        {
          field: 'filters.userId.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
          details: {
            pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i'
          }
        }
      ]
    },
    // totalValue
    {
      properties: { filters: '["=", "totalValue", 1.2]' },
      validations: [
        {
          field: 'filters.totalValue.0',
          rule: 'integer',
          message: 'This value must be an integer'
        }
      ]
    },
    {
      properties: { filters: `["=", "totalValue", ${MAX_INTEGER + 1}]` },
      validations: [
        {
          field: 'filters.totalValue.0',
          rule: 'max',
          message: `This value must be less or equal to: ${MAX_INTEGER}`
        }
      ]
    },
    // createUserId
    {
      properties: { filters: '["=", "createUserId", 1]' },
      validations: [
        { field: 'filters.createUserId.0', rule: 'string', message: 'This value must be a string' }
      ]
    },
    {
      properties: { filters: '["=", "createUserId", "invalid_uuid"]' },
      validations: [
        {
          field: 'filters.createUserId.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
          details: {
            pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i'
          }
        }
      ]
    },
    // updateUserId
    {
      properties: { filters: '["=", "updateUserId", 1]' },
      validations: [
        { field: 'filters.updateUserId.0', rule: 'string', message: 'This value must be a string' }
      ]
    },
    {
      properties: { filters: '["=", "updateUserId", "invalid_uuid"]' },
      validations: [
        {
          field: 'filters.updateUserId.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
          details: {
            pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i'
          }
        }
      ]
    },
    // createdAt
    {
      properties: { filters: '["=", "createdAt", 1]' },
      validations: [
        { field: 'filters.createdAt.0', rule: 'string', message: 'This value must be a string' }
      ]
    },
    {
      properties: { filters: '["=", "createdAt", "invalid_date"]' },
      validations: [
        {
          field: 'filters.createdAt.0',
          rule: 'date',
          message: 'This value must be a valid date'
        }
      ]
    },
    // updatedAt
    {
      properties: { filters: '["=", "updatedAt", 1]' },
      validations: [
        { field: 'filters.updatedAt.0', rule: 'string', message: 'This value must be a string' }
      ]
    },
    {
      properties: { filters: '["=", "updatedAt", "invalid_date"]' },
      validations: [
        {
          field: 'filters.updatedAt.0',
          rule: 'date',
          message: 'This value must be a valid date'
        }
      ]
    }
  ])(
    'Should throw ValidationException for every order invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut()

        const requestModel = {
          filters: '[]',
          ...properties
        } as ListOrderUseCase.RequestModel

        const sutResult = await sut(requestModel).catch((e) => e)

        expect(sutResult).toStrictEqual(new ValidationException(validations))
      })
    }
  )
})
