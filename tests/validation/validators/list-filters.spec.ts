import { ValidationService } from '@/data/contracts/services';
import {
  ArrayValidation,
  ListFiltersValidation,
  ObjectValidation,
  StringValidation,
} from '@/validation/validators';
import { makeValidationServiceStub } from '@tests/data/stubs/services';

function makeSut(
  options: ListFiltersValidation.Options,
  validationService: ValidationService.Validator,
) {
  const sut = new ListFiltersValidation.Validator(
    options,
    new ObjectValidation.Validator(options, validationService),
  );

  return { sut };
}

describe('ListFiltersValidation', () => {
  test('Should return ValidationError if JSON.parse throws', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: 'invalid_filter' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'filters',
      message: 'This value must be a valid list filters and with this posible fields: anyProp',
      rule: 'listFilters',
    });
  });

  test('Should return ValidationError if JSON.parse result is not an array', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: '{}' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'filters',
      message: 'This value must be a valid list filters and with this posible fields: anyProp',
      rule: 'listFilters',
    });
  });

  test('Should return ValidationError if was informed an invalid operator', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: '["invalid_operator"]' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'filters',
      message: 'This value must be a valid list filters and with this posible fields: anyProp',
      rule: 'listFilters',
    });
  });

  test('Should return ValidationError if was informed an value that is not array for filter operators', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: '["&", "invalid array"]' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'filters',
      message: 'This value must be a valid list filters and with this posible fields: anyProp',
      rule: 'listFilters',
    });
  });

  test('Should return ValidationError if was informed an value that is array without length for filter operators', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: '["&", []]' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'filters',
      message: 'This value must be a valid list filters and with this posible fields: anyProp',
      rule: 'listFilters',
    });
  });

  test('Should return ValidationError if was informed an invalid operator inside restItems', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: '["&", ["invalid_operator"]]' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'filters',
      message: 'This value must be a valid list filters and with this posible fields: anyProp',
      rule: 'listFilters',
    });
  });

  test('Should return ValidationError if was informed an invalid string field', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: '["=", 1, "any_value"]' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'filters',
      message: 'This value must be a valid list filters and with this posible fields: anyProp',
      rule: 'listFilters',
    });
  });

  test('Should return ValidationError if was informed an invalid posibleFields', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: '["=", "imposibleField", "any_value"]' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'filters',
      message: 'This value must be a valid list filters and with this posible fields: anyProp',
      rule: 'listFilters',
    });
  });

  test('Should return ValidationError if was informed an invalid field value', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: '["=", "anyProp", ["array_instead_of_string_or_number"]]' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'filters',
      message: 'This value must be a valid list filters and with this posible fields: anyProp',
      rule: 'listFilters',
    });
  });

  test('Should return ValidationError if was informed an invalid string field for `in` operator', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: '["in", 1, ["any_value"]]' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'filters',
      message: 'This value must be a valid list filters and with this posible fields: anyProp',
      rule: 'listFilters',
    });
  });

  test('Should return ValidationError if was informed an invalid posibleFields for `in` operator', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: '["in", "imposibleField", ["any_value"]]' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'filters',
      message: 'This value must be a valid list filters and with this posible fields: anyProp',
      rule: 'listFilters',
    });
  });

  test('Should return ValidationError if was informed an invalid array for `in` operator', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: '["in", "anyProp", "invalid_array"]' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'filters',
      message: 'This value must be a valid list filters and with this posible fields: anyProp',
      rule: 'listFilters',
    });
  });

  test('Should return ValidationError if was informed an invalid field value for `in` operator', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: '["in", "anyProp", [["array_inside_base_array"]]]' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toStrictEqual({
      field: 'filters',
      message: 'This value must be a valid list filters and with this posible fields: anyProp',
      rule: 'listFilters',
    });
  });

  test('Should return null if is a valid filter and performValidation for nested rules', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator(
            { validations: [new StringValidation.Validator()] },
            validationService,
          ),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = {
      filters:
        '["&", ["|", ["=", "anyProp", "anyValue"], ["!=", "anyProp", "anyValue"], [">", "anyProp", "anyValue"], [">=", "anyProp", "anyValue"], ["<", "anyProp", "anyValue"], ["<=", "anyProp", "anyValue"], [":", "anyProp", "anyValue"], ["!:", "anyProp", "anyValue"], ["in", "anyProp", ["anyValue"]]]]',
    };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toBeNull();
  });

  test('Should return null if no value is provided', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: undefined };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toBeNull();
  });

  test('Should return null if JSON.parse returns an empty array', async () => {
    const validationService = makeValidationServiceStub();
    const options = {
      schema: {
        anyProp: <[ArrayValidation.Validator]>[
          new ArrayValidation.Validator({ validations: [] }, validationService),
        ],
      },
    };
    const { sut } = makeSut(options, validationService);

    const key = 'filters';
    const model = { filters: '[]' };
    const data = {};
    const sutResult = await sut.validate({ key, model, data });

    expect(sutResult).toBeNull();
  });
});
