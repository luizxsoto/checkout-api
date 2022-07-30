import { LengthValidation } from '@/validation/validators'

function makeSut(options: LengthValidation.Options) {
  const sut = new LengthValidation.Validator(options)

  return { sut }
}

describe('LengthValidation', () => {
  test('Should return ValidationError if the string is less then minLength', () => {
    const options = { minLength: 5, maxLength: 5 }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'less' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value length must be beetween ${options.minLength} and ${options.maxLength}`,
      rule: 'length'
    })
  })

  test('Should return ValidationError if the string is bigger then maxLength', () => {
    const options = { minLength: 5, maxLength: 5 }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'bigger' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value length must be beetween ${options.minLength} and ${options.maxLength}`,
      rule: 'length'
    })
  })

  test('Should return ValidationError if the array is less then minLength', () => {
    const options = { minLength: 5, maxLength: 5 }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: ['l', 'e', 's', 's'] }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value length must be beetween ${options.minLength} and ${options.maxLength}`,
      rule: 'length'
    })
  })

  test('Should return ValidationError if the array is bigger then maxLength', () => {
    const options = { minLength: 5, maxLength: 5 }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: ['b', 'i', 'g', 'g', 'e', 'r'] }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value length must be beetween ${options.minLength} and ${options.maxLength}`,
      rule: 'length'
    })
  })

  test('Should return null if the string has correct length', () => {
    const options = { minLength: 7, maxLength: 7 }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'correct' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })

  test('Should return null if the array has correct length', () => {
    const options = { minLength: 7, maxLength: 7 }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: ['c', 'o', 'r', 'r', 'e', 'c', 't'] }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })

  test('Should return null if no value is provided', () => {
    const options = { minLength: 7, maxLength: 7 }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: undefined }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })
})
