import { StringValidation } from '@/validation/validators'

function makeSut(options?: StringValidation.Options) {
  const sut = new StringValidation.Validator(options)

  return { sut }
}

describe('StringValidation', () => {
  test('Should return ValidationError if the value is not string', () => {
    const { sut } = makeSut()

    const key = 'anyProp'
    const model = { anyProp: 1 }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: 'This value must be a string',
      rule: 'string',
    })
  })

  test('Should return null if the value is string', () => {
    const { sut } = makeSut()

    const key = 'anyProp'
    const model = { anyProp: 'valid_string' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })

  test('Should return null if no value is provided', () => {
    const { sut } = makeSut()

    const key = 'anyProp'
    const model = { anyProp: undefined }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })
})
