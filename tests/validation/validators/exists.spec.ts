import { ExistsValidation } from '@/validation/validators';

function makeSut(options: ExistsValidation.Options) {
  const sut = new ExistsValidation.Validator(options);

  return { sut };
}

describe('ExistsValidation', () => {
  test('Should return ValidationError if the value was not found', async () => {
    const options = {
      dataEntity: 'anyData',
      props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
    };
    const { sut } = makeSut(options);

    const key = 'anyProp';
    const model = { anyProp: 'other_value' };
    const data = { anyData: [{ anyProp: 'any_value' }] };
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: 'This value was not found',
      rule: 'exists',
    });
  });

  test('Should return nul if the value was found', async () => {
    const options = {
      dataEntity: 'anyData',
      props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
    };
    const { sut } = makeSut(options);

    const key = 'anyProp';
    const model = { anyProp: 'any_value' };
    const data = { anyData: [{ anyProp: 'any_value' }] };
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toBeNull();
  });

  test('Should return nul if the value was found with nested key', async () => {
    const options = {
      dataEntity: 'anyData',
      props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
    };
    const { sut } = makeSut(options);

    const key = 'nested.anyProp';
    const model = { nested: { anyProp: 'any_value' } };
    const data = { anyData: [{ anyProp: 'any_value' }] };
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toBeNull();
  });

  test('Should return null if no value is provided', async () => {
    const options = {
      dataEntity: 'anyData',
      props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
    };
    const { sut } = makeSut(options);

    const key = 'anyProp';
    const model = { anyProp: undefined };
    const data = { anyData: [{ anyProp: 'any_value' }] };
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toBeNull();
  });
});
