import { ValidationBuilder } from '@/main/builders';
import {
  ArrayValidation,
  DistinctValidation,
  InValidation,
  LengthValidation,
  ObjectValidation,
  RegexValidation,
  RequiredValidation,
  StringValidation,
  UniqueValidation,
} from '@/validation/validators';
import { makeValidationServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const sut = new ValidationBuilder();

  return { sut };
}

describe(ValidationBuilder.name, () => {
  test('Should build correctly the validations', () => {
    const { sut } = makeSut();
    const validationService = makeValidationServiceStub();

    const sutResult = sut
      .string()
      .object({ schema: {} }, validationService)
      .array({ validations: [] }, validationService)
      .required()
      .length({ minLength: 1, maxLength: 1 })
      .regex({ pattern: 'custom', customPattern: /custom/ })
      .in({ values: [] })
      .distinct()
      .unique({ dataEntity: 'anyData', props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }] })
      .build();

    expect(sutResult).toStrictEqual([
      new StringValidation.Validator(),
      new ObjectValidation.Validator({ schema: {} }, validationService),
      new ArrayValidation.Validator({ validations: [] }, validationService),
      new RequiredValidation.Validator(),
      new LengthValidation.Validator({ minLength: 1, maxLength: 1 }),
      new RegexValidation.Validator({ pattern: 'custom', customPattern: /custom/ }),
      new InValidation.Validator({ values: [] }),
      new DistinctValidation.Validator(),
      new UniqueValidation.Validator({
        dataEntity: 'anyData',
        props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
      }),
    ]);
  });
});
