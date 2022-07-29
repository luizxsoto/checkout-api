import { RegexValidation } from '@/validation/validators'

function makeSut(options: RegexValidation.Options) {
  const sut = new RegexValidation.Validator(options)

  return { sut }
}

describe('RegexValidation', () => {
  test('Should return ValidationError if the value does not match with pattern: custom', () => {
    const options = <RegexValidation.Options>{ pattern: 'custom', customPattern: /customPattern/ }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'invalid_custom' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value must be valid according to the pattern: ${options.pattern}`,
      rule: 'regex',
      details: { pattern: String(options.customPattern) },
    })
  })

  test('Should return ValidationError if the value does not match with pattern: name', () => {
    const options = <RegexValidation.Options>{ pattern: 'name' }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: ' iNv@l1 -_- n@m3 ' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value must be valid according to the pattern: ${options.pattern}`,
      rule: 'regex',
      details: { pattern: String(/^([a-zA-Z\u00C0-\u00FF]+\s)*[a-zA-Z\u00C0-\u00FF]+$/) },
    })
  })

  test('Should return ValidationError if the value does not match with pattern: email', () => {
    const options = <RegexValidation.Options>{ pattern: 'email' }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'invalid_email' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value must be valid according to the pattern: ${options.pattern}`,
      rule: 'regex',
      details: { pattern: String(/^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/) },
    })
  })

  test('Should return ValidationError if the value does not match with pattern: password', () => {
    const options = <RegexValidation.Options>{ pattern: 'password' }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'invalid_password' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value must be valid according to the pattern: ${options.pattern}`,
      rule: 'regex',
      details: {
        pattern: String(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
      },
    })
  })

  test('Should return ValidationError if the value does not match with pattern: uuidV4', () => {
    const options = <RegexValidation.Options>{ pattern: 'uuidV4' }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'invalid_uuidV4' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value must be valid according to the pattern: ${options.pattern}`,
      rule: 'regex',
      details: {
        pattern: String(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i),
      },
    })
  })

  test('Should return ValidationError if the value does not match with pattern: url', () => {
    const options = <RegexValidation.Options>{ pattern: 'url' }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'invalid_url' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value must be valid according to the pattern: ${options.pattern}`,
      rule: 'regex',
      details: {
        pattern: String(
          /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi
        ),
      },
    })
  })

  test('Should return null if the value matches with pattern', () => {
    const options = <RegexValidation.Options>{ pattern: 'custom', customPattern: /correct/ }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'correct' }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })

  test('Should return null if the value matches with pattern', () => {
    const options = <RegexValidation.Options>{ pattern: 'custom', customPattern: /correct/ }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: undefined }
    const data = {}
    const sutResult = sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })
})
