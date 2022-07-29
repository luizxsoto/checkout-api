import { IntegerValidation } from '@/validation/validators'

function makeSut(options?: IntegerValidation.Options) {
  const sut = new IntegerValidation.Validator(options)

  return { sut }
}

describe('IntegerValidation', () => {
  test('Should return ValidationError if the value is an invalid integer', () => {
    const { sut } = makeSut()

    const key = 'anyProp'
    const model = { anyProp: 1.2 }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: 'This value must be an integer',
      rule: 'integer',
    })
  })

  test('Should return null if the value is a valid integer', () => {
    const { sut } = makeSut()

    const key = 'anyProp'
    const model = { anyProp: 12 }
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
