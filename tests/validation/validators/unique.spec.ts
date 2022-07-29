import { UniqueValidation } from '@/validation/validators'

function makeSut(options: UniqueValidation.Options) {
  const sut = new UniqueValidation.Validator(options)

  return { sut }
}

describe('UniqueValidation', () => {
  test('Should return ValidationError if the value has already been used', async () => {
    const options = {
      dataEntity: 'anyData',
      props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
    }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'any_value' }
    const data = { anyData: [{ anyProp: 'any_value' }] }
    const sutResult = await sut.validate({ key, model, data })

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: 'This value has already been used',
      rule: 'unique',
      details: { findedRegister: { anyProp: 'any_value' } },
    })
  })

  test('Should return null if the value has not already been used', async () => {
    const options = {
      dataEntity: 'anyData',
      props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
    }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'any_value' }
    const data = { anyData: [{ anyProp: 'other_value' }] }
    const sutResult = await sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })

  test('Should return null if isSameIgnoreProps', async () => {
    const options = {
      dataEntity: 'anyData',
      ignoreProps: [{ modelKey: 'ignoreProp', dataKey: 'ignoreProp' }],
      props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
    }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: 'any_value', ignoreProp: 'same_ignore_value' }
    const data = { anyData: [{ anyProp: 'any_value', ignoreProp: 'same_ignore_value' }] }
    const sutResult = await sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })

  test('Should return null if isSameIgnoreProps with nested key', async () => {
    const options = {
      dataEntity: 'anyData',
      ignoreProps: [{ modelKey: 'ignoreProp', dataKey: 'ignoreProp' }],
      props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
    }
    const { sut } = makeSut(options)

    const key = 'nested.anyProp'
    const model = { nested: { anyProp: 'any_value', ignoreProp: 'same_ignore_value' } }
    const data = { anyData: [{ anyProp: 'any_value', ignoreProp: 'same_ignore_value' }] }
    const sutResult = await sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })

  test('Should return null if no value is provided', async () => {
    const options = {
      dataEntity: 'anyData',
      props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
    }
    const { sut } = makeSut(options)

    const key = 'anyProp'
    const model = { anyProp: undefined }
    const data = { anyData: [{ anyProp: 'any_value' }] }
    const sutResult = await sut.validate({ key, model, data })

    expect(sutResult).toBeNull()
  })
})
