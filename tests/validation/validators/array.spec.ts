import { ArrayValidation, StringValidation } from '@/validation/validators';
import { makeValidationServiceStub } from '@tests/data/stubs/services';

function makeSut(options: ArrayValidation.Options) {
  const validationService = makeValidationServiceStub();
  const sut = new ArrayValidation.Validator(options, validationService);

  return { validationService, sut };
}

describe('ArrayValidation', () => {
  test('Should return ValidationError if the value is an invalid array', async () => {
    const options = { validations: [] };
    const { validationService, sut } = makeSut(options);

    const key = 'anyProp';
    const model = { anyProp: 'invalid_array' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'anyProp',
      message: 'This value must be an array',
      rule: 'array',
    });
    expect(validationService.performValidation).not.toBeCalled();
  });

  test('Should return null and performValidation for nested rules', async () => {
    const options = { validations: [new StringValidation.Validator()] };
    const { validationService, sut } = makeSut(options);

    const key = 'anyProp';
    const model = { anyProp: ['anyValue'] };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toBeNull();
    expect(validationService.performValidation).toBeCalledWith(
      options.validations,
      `${key}.0`,
      model,
      data,
    );
  });

  test('Should return null if no value is provided', async () => {
    const options = { validations: [new StringValidation.Validator()] };
    const { validationService, sut } = makeSut(options);

    const key = 'anyProp';
    const model = { anyProp: undefined };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toBeNull();
    expect(validationService.performValidation).not.toBeCalled();
  });
});
