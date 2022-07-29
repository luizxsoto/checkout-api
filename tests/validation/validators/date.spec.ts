import { DateValidation } from '@/validation/validators'

function makeSut(options?: DateValidation.Options) {
  const sut = new DateValidation.Validator(options)

  return { sut }
}

describe('DateValidation', () => {
  test('Should return ValidationError if the value is an invalid date', () => {
    const { sut } = makeSut()

    const key = 'anyProp'
    const model = { anyProp: 'invalid_date' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: 'This value must be a valid date',
      rule: 'date',
    })
  })

  test('Should return ValidationError if the value is a nonexistent date', () => {
    const { sut } = makeSut()

    const key = 'anyProp'
    const model = { anyProp: '0001-02-31' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: 'This value must be a valid date',
      rule: 'date',
    })
  })

  test('Should return null if the value is a valid date', () => {
    const { sut } = makeSut()

    const key = 'anyProp'
    const model = { anyProp: '0001-01-01' }
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
