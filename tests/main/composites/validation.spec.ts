import { CompositeValidation } from '@/main/composites';
import { ValidationException } from '@/main/exceptions';
import { FieldValidation } from '@/validation/protocols';

function makeSut() {
  const validation = { validate: jest.fn(async (): Promise<FieldValidation.Result> => null) };
  const sut = new CompositeValidation();

  return { validation, sut };
}

describe(CompositeValidation.name, () => {
  test('Should validate correctly the provided schema', async () => {
    const { validation, sut } = makeSut();

    const sutResult = await sut.validate({
      schema: { anyProp: [validation] },
      model: { anyProp: 'any_value' },
      data: {},
    });

    expect(sutResult).toBeUndefined();
    expect(validation.validate).toBeCalledWith({
      key: 'anyProp',
      model: { anyProp: 'any_value' },
      data: {},
    });
  });

  test('Should throw if validations returns', async () => {
    const { validation, sut } = makeSut();

    const validationResult = {
      field: 'anyProp',
      rule: 'anyRule',
      message: 'Something wrong is not right',
    };

    validation.validate.mockReturnValueOnce(Promise.resolve(validationResult));

    const sutResult = sut.validate({
      schema: { anyProp: [validation] },
      model: { anyProp: 'any_value' },
      data: {},
    });

    await expect(sutResult).rejects.toStrictEqual(new ValidationException([validationResult]));
    expect(validation.validate).toBeCalledWith({
      key: 'anyProp',
      model: { anyProp: 'any_value' },
      data: {},
    });
  });
});
