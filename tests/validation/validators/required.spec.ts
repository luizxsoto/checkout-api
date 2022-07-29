import { RequiredValidation } from '@/validation/validators'

function makeSut(options?: RequiredValidation.Options) {
  const sut = new RequiredValidation.Validator(options)

  return { sut }
}

describe('RequiredValidation', () => {
  test('Should return ValidationError if no value is provided', () => {
    const { sut } = makeSut()

    const key = 'anyProp'
    const model = { anyProp: undefined }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: 'This value is required',
      rule: 'required',
    })
  })

  test('Should return null if value is provided', () => {
    const { sut } = makeSut()

    const key = 'anyProp'
    const model = { anyProp: 'any_value' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })
})
