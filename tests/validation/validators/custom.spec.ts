import { CustomValidation } from '@/validation/validators'

function makeSut(options: CustomValidation.Options) {
  const sut = new CustomValidation.Validator(options)

  return { sut }
}

describe('CustomValidation', () => {
  test('Should return ValidationError if custom validation returns false', async () => {
    const options = {
      validation: () => Promise.resolve(false),
      rule: 'any_rule',
      message: 'any_message',
    }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'invalid_prop' }
    const data = {}
    const sutResult = await sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({ field: 'anyProp', message: 'any_message', rule: 'any_rule' })
  })

  test('Should return null if custom validation returns true', async () => {
    const options = {
      validation: () => Promise.resolve(true),
      rule: 'any_rule',
      message: 'any_message',
    }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'invalid_prop' }
    const data = {}
    const sutResult = await sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })
})
