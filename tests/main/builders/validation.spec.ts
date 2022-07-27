import { ValidationBuilder } from '@/main/builders';
import {
  ArrayValidation,
  CustomValidation,
  DateValidation,
  DistinctValidation,
  ExistsValidation,
  InValidation,
  IntegerValidation,
  LengthValidation,
  ListFiltersValidation,
  MaxValidation,
  MinValidation,
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
      .array({ validations: [] }, validationService)
      .custom({ validation: () => Promise.resolve(true), rule: 'any_rule', message: 'any_message' })
      .date()
      .distinct()
      .exists({ dataEntity: 'anyData', props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }] })
      .in({ values: [] })
      .integer()
      .length({ minLength: 1, maxLength: 1 })
      .listFilers({ schema: {} }, new ObjectValidation.Validator({ schema: {} }, validationService))
      .max({ value: 1 })
      .min({ value: 1 })
      .object({ schema: {} }, validationService)
      .regex({ pattern: 'custom', customPattern: /custom/ })
      .required()
      .string()
      .unique({ dataEntity: 'anyData', props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }] })
      .build();

    expect(sutResult).toStrictEqual([
      new ArrayValidation.Validator({ validations: [] }, validationService),
      new CustomValidation.Validator({
        validation: expect.any(Function),
        rule: 'any_rule',
        message: 'any_message',
      }),
      new DateValidation.Validator(),
      new DistinctValidation.Validator(),
      new ExistsValidation.Validator({
        dataEntity: 'anyData',
        props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
      }),
      new InValidation.Validator({ values: [] }),
      new IntegerValidation.Validator(),
      new LengthValidation.Validator({ minLength: 1, maxLength: 1 }),
      new ListFiltersValidation.Validator(
        { schema: {} },
        new ObjectValidation.Validator({ schema: {} }, validationService),
      ),
      new MaxValidation.Validator({ value: 1 }),
      new MinValidation.Validator({ value: 1 }),
      new ObjectValidation.Validator({ schema: {} }, validationService),
      new RegexValidation.Validator({ pattern: 'custom', customPattern: /custom/ }),
      new RequiredValidation.Validator(),
      new StringValidation.Validator(),
      new UniqueValidation.Validator({
        dataEntity: 'anyData',
        props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
      }),
    ]);
  });
});
