import { DistinctValidation } from '@/validation/validators'

function makeSut(options?: DistinctValidation.Options) {
  const sut = new DistinctValidation.Validator(options)

  return { sut }
}

describe('DistinctValidation', () => {
  test('Should return ValidationError if the array has duplicated primitive values', () => {
    const { sut } = makeSut()

    const key = 'anyProp'
    const model = { anyProp: ['same_value', 'same_value'] }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: 'This value cannot have duplicate items',
      rule: 'distinct',
    })
  })

  test('Should return ValidationError if the array has duplicated object values', () => {
    const options = { keys: ['anyKey'] }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: [{ anyKey: 'same_value' }, { anyKey: 'same_value' }] }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value cannot have duplicate items by: ${options.keys.join(', ')}`,
      rule: 'distinct',
    })
  })

  test('Should return null if the array has no duplicated primitive values', () => {
    const { sut } = makeSut()

    const key = 'anyProp'
    const model = { anyProp: ['any_value', 'other_value'] }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })

  test('Should return null if the array has no duplicated object values', () => {
    const options = { keys: ['anyKey'] }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: [{ anyKey: 'any_value' }, { anyKey: 'other_value' }] }
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

  test('Should return null if is provided an invalid array', () => {
    const { sut } = makeSut()

    const key = 'anyProp'
    const model = { anyProp: 'invalid_array' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })
})
