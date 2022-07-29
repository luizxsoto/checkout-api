import { makeValidationServiceStub } from '@tests/data/stubs/services'

import { ValidationService } from '@/data/contracts/services'
import { ObjectValidation, StringValidation } from '@/validation/validators'

function makeSut(options: ObjectValidation.Options) {
  const validationService = makeValidationServiceStub()
  const sut = new ObjectValidation.Validator(options, validationService)

  return { validationService, sut }
}

describe('ObjectValidation', () => {
  test('Should return ValidationError if the value is an invalid object', async () => {
    const options = { schema: {} }
    const { validationService, sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'invalid_object' }
    const data = {}
    const sutResult = await sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: 'This value must be an object',
      rule: 'object',
    })
    expect(validationService.performValidation).not.toBeCalled()
  })

  test('Should return null and performValidation for nested rules', async () => {
    const options = {
      schema: <ValidationService.Schema>{ nestedProp: [new StringValidation.Validator()] },
    }
    const { validationService, sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: { nestedProp: 'nested_value' } }
    const data = {}
    const sutResult = await sut.validate({ key, model, data })

    const parsedSchema = {} as ValidationService.Schema
    Object.keys(options.schema).forEach((nestedKey) => {
      parsedSchema[`${key}.${nestedKey}`] = options.schema[nestedKey]
    })

    expect(sutResult).toBeNull()
    expect(validationService.validate).toBeCalledWith({ schema: parsedSchema, model, data })
  })

  test('Should return null if no value is provided', async () => {
    const options = { schema: {} }
    const { validationService, sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: undefined }
    const data = {}
    const sutResult = await sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
    expect(validationService.performValidation).not.toBeCalled()
  })
})
