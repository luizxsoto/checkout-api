import { VanillaValidatorService } from '@/infra/services/validator';
import { ValidationException } from '@/main/exceptions';

function makeSut() {
  const sut = new VanillaValidatorService();

  return { sut };
}

describe(VanillaValidatorService.name, () => {
  describe('Should throw if a required value was not informed', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.required()] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'required', message: 'This value is required' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.required()] },
          model: { anyProp: 'anyProp' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value should be string, but is not', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.string()] },
          model: { anyProp: 1 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'string', message: 'This value must be a string' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.string()] },
          model: { anyProp: 'anyProp' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.string()] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value should be a valid date, but is not', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.date()] },
          model: { anyProp: 'invalid_date' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'date', message: 'This value must be a valid date' },
        ]),
      );
    });

    test('Should throw if is nonexistent date', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.date()] },
          model: { anyProp: '0001-02-31' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'date', message: 'This value must be a valid date' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.date()] },
          model: { anyProp: '0001-01-01' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.date()] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value should be in, but is not', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.in({ values: ['anyValue', 'otherAnyValue'] })] },
          model: { anyProp: 'someValue' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'in',
            message: 'This value must be in: anyValue, otherAnyValue',
          },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.in({ values: ['anyValue'] })] },
          model: { anyProp: 'anyValue' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.in({ values: ['anyValue'] })] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value should be number, but is not', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.number()] },
          model: { anyProp: 'anyProp' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'number', message: 'This value must be a number' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.number()] },
          model: { anyProp: 1 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.number()] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value should be integer, but is not', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.integer()] },
          model: { anyProp: 1.2 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'integer',
            message: 'This value must be an integer',
          },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.integer()] },
          model: { anyProp: 12 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.integer()] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value should be integerString, but is not', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.integerString()] },
          model: { anyProp: '1e2' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'integerString',
            message: 'This value must be an integer in a string',
          },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.integerString()] },
          model: { anyProp: '12' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.integerString()] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value is smaller than min', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.min({ value: 2 })] },
          model: { anyProp: 1 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'min', message: 'This value must be bigger than: 2' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.min({ value: 2 })] },
          model: { anyProp: 2 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.min({ value: 2 })] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value is bigger than max', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.max({ value: 2 })] },
          model: { anyProp: 3 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'max', message: 'This value must be smaller than: 2' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.max({ value: 2 })] },
          model: { anyProp: 2 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.max({ value: 2 })] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value does not match with a regex', () => {
    test('regex: custom', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.regex({ pattern: 'custom', customPattern: /customPattern/ })],
          },
          model: { anyProp: 'invalid_custom' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: /customPattern/',
          },
        ]),
      );
    });

    test('regex: name', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.regex({ pattern: 'name' })] },
          model: { anyProp: ' iNv@l1 -_- n@m3 ' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: name',
          },
        ]),
      );
    });

    test('regex: email', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.regex({ pattern: 'email' })] },
          model: { anyProp: 'invalid_email' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: email',
          },
        ]),
      );
    });

    test('regex: password', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.regex({ pattern: 'password' })] },
          model: { anyProp: 'invalid_password' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: password',
          },
        ]),
      );
    });

    test('regex: uuidV4', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.regex({ pattern: 'uuidV4' })] },
          model: { anyProp: 'invalid_uuidV4' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: uuidV4',
          },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.regex({ pattern: 'name' })] },
          model: { anyProp: 'Any Prop' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.regex({ pattern: 'name' })] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value is out of length', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.length({ minLength: 6, maxLength: 22 })] },
          model: { anyProp: 'lowerOrBiggerThenLength' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'length',
            message: 'This value length must be beetween 6 and 22',
          },
        ]),
      );
    });

    test('Should not throw with string value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.length({ minLength: 6, maxLength: 13 })] },
          model: { anyProp: 'correctLength' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw with array value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.length({ minLength: 6, maxLength: 13 })] },
          model: { anyProp: ['c', 'o', 'r', 'r', 'e', 'c', 't', 'L', 'e', 'n', 'g', 't', 'h'] },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.length({ minLength: 6, maxLength: 13 })] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value has already been used', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.unique({
                dataEntity: 'anyData',
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: 'anyProp' },
          data: { anyData: [{ anyProp: 'anyProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'unique', message: 'This value has already been used' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.unique({
                dataEntity: 'anyData',
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: 'anyOtherProp' },
          data: { anyData: [{ anyProp: 'anyProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if isSameIgnoreProps', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.unique({
                dataEntity: 'anyData',
                ignoreProps: [{ modelKey: 'otherProp', dataKey: 'otherProp' }],
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: 'anyProp', otherProp: 'otherProp' },
          data: { anyData: [{ anyProp: 'anyProp', otherProp: 'otherProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is nested key', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            nested: [
              sut.rules.object({
                schema: {
                  anyProp: [
                    sut.rules.unique({
                      dataEntity: 'anyData',
                      ignoreProps: [{ modelKey: 'otherProp', dataKey: 'otherProp' }],
                      props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
                    }),
                  ],
                },
              }),
            ],
          },
          model: { nested: { anyProp: 'anyProp', otherProp: 'otherProp' } },
          data: { anyData: [{ anyProp: 'anyProp', otherProp: 'otherProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.unique({
                dataEntity: 'anyData',
                ignoreProps: [{ modelKey: 'otherProp', dataKey: 'otherProp' }],
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: undefined, otherProp: undefined },
          data: { anyData: [{ anyProp: 'anyProp', otherProp: 'otherProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value was not found', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.exists({
                dataEntity: 'anyData',
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: 'anyOtherProp' },
          data: { anyData: [{ anyProp: 'anyProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'exists', message: 'This value was not found' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.exists({
                dataEntity: 'anyData',
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: 'anyProp' },
          data: { anyData: [{ anyProp: 'anyProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is nested key', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            nested: [
              sut.rules.object({
                schema: {
                  anyProp: [
                    sut.rules.exists({
                      dataEntity: 'anyData',
                      props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
                    }),
                  ],
                },
              }),
            ],
          },
          model: { nested: { anyProp: 'anyProp' } },
          data: { anyData: [{ anyProp: 'anyProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.exists({
                dataEntity: 'anyData',
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: undefined },
          data: { anyData: [{ anyProp: 'anyProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value has duplicated items', () => {
    test('Should throw for primitive array', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.distinct({})],
          },
          model: { anyProp: ['duplicatedItem', 'duplicatedItem'] },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'distinct',
            message: 'This value cannot have duplicate items',
          },
        ]),
      );
    });

    test('Should throw for object array', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.distinct({ keys: ['anyKey'] })],
          },
          model: { anyProp: [{ anyKey: 'duplicatedItem' }, { anyKey: 'duplicatedItem' }] },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'distinct',
            message: 'This value cannot have duplicate items by: anyKey',
          },
        ]),
      );
    });

    test('Should not throw for primitive array', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.distinct({})],
          },
          model: { anyProp: ['someItem', 'otherItem'] },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw for object array', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.distinct({ keys: ['anyKey'] })],
          },
          model: { anyProp: [{ anyKey: 'someItem' }, { anyKey: 'otherItem' }] },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.distinct({})],
          },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a array value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.distinct({})],
          },
          model: { anyProp: 'invalid_array' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value is an invalid array', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.array({
                rules: [],
              }),
            ],
          },
          model: { anyProp: 'invalid_array' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'array', message: 'This value must be an array' },
        ]),
      );
    });

    test('Should not throw and performValidation for nested rules', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.array({ rules: [sut.rules.string()] })],
          },
          model: { anyProp: ['anyProp'] },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.array({ rules: [] })],
          },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value is an invalid object', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.object({
                schema: {},
              }),
            ],
          },
          model: { anyProp: 'invalid_object' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'object', message: 'This value must be an object' },
        ]),
      );
    });

    test('Should not throw and performValidation for nested rules', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.object({ schema: { otherProp: [sut.rules.string()] } })],
          },
          model: { anyProp: { otherProp: 'otherProp' } },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.object({ schema: {} })],
          },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value is an invalid list filters', () => {
    test('Should throw if JSON.parse throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.listFilters({ schema: {} })],
          },
          model: { anyProp: 'invalid_filter' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'listFilters',
            message: 'This value must be a valid list filters and with this posible fields: ',
          },
        ]),
      );
    });

    test('Should throw if JSON.parse result is not an array', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.listFilters({ schema: {} })],
          },
          model: { anyProp: '{}' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'listFilters',
            message: 'This value must be a valid list filters and with this posible fields: ',
          },
        ]),
      );
    });

    test('Should throw if was informed an invalid operator', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.listFilters({ schema: {} })],
          },
          model: { anyProp: '["invalid_operator"]' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'listFilters',
            message: 'This value must be a valid list filters and with this posible fields: ',
          },
        ]),
      );
    });

    test('Should throw if was informed an item that is not array for filter operators', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.listFilters({ schema: {} })],
          },
          model: { anyProp: '["&", "invalid array"]' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'listFilters',
            message: 'This value must be a valid list filters and with this posible fields: ',
          },
        ]),
      );
    });

    test('Should throw if was informed an item that is array without length for filter operators', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.listFilters({ schema: {} })],
          },
          model: { anyProp: '["&", []]' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'listFilters',
            message: 'This value must be a valid list filters and with this posible fields: ',
          },
        ]),
      );
    });

    test('Should throw if was informed an item that is array with invalid operator for filter operators', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.listFilters({ schema: {} })],
          },
          model: { anyProp: '["&", ["invalid_operator"]]' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'listFilters',
            message: 'This value must be a valid list filters and with this posible fields: ',
          },
        ]),
      );
    });

    test('Should throw if was informed an invalid item for field operators', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.listFilters({
                schema: { otherProp: [sut.rules.array({ rules: [sut.rules.string()] })] },
              }),
            ],
          },
          model: { anyProp: '["=", "otherProp", ["invalid_value"]]' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'listFilters',
            message:
              'This value must be a valid list filters and with this posible fields: otherProp',
          },
        ]),
      );
    });

    test('Should throw if was informed an invalid item for `in` operator', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.listFilters({
                schema: { otherProp: [sut.rules.array({ rules: [sut.rules.string()] })] },
              }),
            ],
          },
          model: { anyProp: '["in", "otherProp", [["invalid_array_inside_value"]]]' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'listFilters',
            message:
              'This value must be a valid list filters and with this posible fields: otherProp',
          },
        ]),
      );
    });

    test('Should not throw and performValidation for nested rules', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.listFilters({
                schema: { otherProp: [sut.rules.array({ rules: [sut.rules.string()] })] },
              }),
            ],
          },
          model: {
            anyProp:
              '["&", ["|", ["=", "otherProp", "anyValue"], ["!=", "otherProp", "anyValue"], [">", "otherProp", "anyValue"], [">=", "otherProp", "anyValue"], ["<", "otherProp", "anyValue"], ["<=", "otherProp", "anyValue"], [":", "otherProp", "anyValue"], ["!:", "otherProp", "anyValue"], ["in", "otherProp", ["anyValue"]]]]',
          },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.listFilters({ schema: {} })],
          },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if JSON.parse returns an empty array', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.listFilters({ schema: {} })],
          },
          model: { anyProp: '[]' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if custom validation returns false', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.custom({
                validation: () => Promise.resolve(false),
                rule: 'custom',
                message: 'Custom error message',
              }),
            ],
          },
          model: { anyProp: 'anyProp' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'custom', message: 'Custom error message' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.custom({
                validation: () => Promise.resolve(true),
                rule: 'custom',
                message: 'Custom error message',
              }),
            ],
          },
          model: { anyProp: 'anyProp' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });
});
