import { MinValidation } from '@/validation/validators'

function makeSut(options: MinValidation.Options) {
  const sut = new MinValidation.Validator(options)

  return { sut }
}

describe('MinValidation', () => {
  test('Should return ValidationError if the value is less then min', () => {
    const options = { value: 2 }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 1 }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value must be bigger or equal to: ${options.value}`,
      rule: 'min'
    })
  })

  test('Should return null if the value is bigger then min', () => {
    const options = { value: 2 }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 3 }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })

  test('Should return null if the value is equal to min', () => {
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
