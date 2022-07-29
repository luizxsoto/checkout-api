import { MaxValidation } from '@/validation/validators'

function makeSut(options: MaxValidation.Options) {
  const sut = new MaxValidation.Validator(options)

  return { sut }
}

describe('MaxValidation', () => {
  test('Should return ValidationError if the value is bigger then max', () => {
    const options = { value: 2 }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 3 }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value must be less or equal to: ${options.value}`,
      rule: 'max',
    })
  })

  test('Should return null if the value is less then max', () => {
    const options = { value: 2 }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 1 }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })

  test('Should return null if the value is equal to max', () => {
    const options = { value: 2 }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 2 }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })

  test('Should return null if no value is provided', () => {
    const options = { value: 2 }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: undefined }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })
})
