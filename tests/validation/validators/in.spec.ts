import { InValidation } from '@/validation/validators';

function makeSut(options: InValidation.Options) {
  const sut = new InValidation.Validator(options);

  return { sut };
}

describe('InValidation', () => {
  test('Should return ValidationError if the value is not in the specified values', () => {
    const options = { values: ['any_value'] };
    const { sut } = makeSut(options);

    const key = 'anyProp';
    const model = { anyProp: 'other_value' };
    const data = {};
    const sutResult = sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: `This value must be in: ${options.values.join(', ')}`,
      rule: 'in',
    });
  });

  test('Should return null if the value is in the specified values', () => {
    const options = { values: ['any_value'] };
    const { sut } = makeSut(options);

    const key = 'anyProp';
    const model = { anyProp: 'any_value' };
    const data = {};
    const sutResult = sut.validate({ key, model, data });

    expect(sutResult).toBeNull();
  });

  test('Should return null if no value is provided', () => {
    const options = { values: ['any_value'] };
    const { sut } = makeSut(options);

    const key = 'anyProp';
    const model = { anyProp: undefined };
    const data = {};
    const sutResult = sut.validate({ key, model, data });

    expect(sutResult).toBeNull();
  });
});
