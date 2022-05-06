import { ValidationException } from '@/infra/exceptions';
import { VanillaValidatorService } from '@/infra/services/validator';

function makeSut() {
  const sut = new VanillaValidatorService();

  return { sut };
}

describe(VanillaValidatorService.name, () => {
  test('Should throw if a required value was not informed', async () => {
    const { sut } = makeSut();

    const sutResult = await sut
      .validate({
        schema: { anyProp: [sut.rules.required()] },
        model: { anyProp: undefined },
        data: { anyData: async () => [] },
      })
      .catch((e) => e);

    expect(sutResult).toStrictEqual(
      new ValidationException([
        { field: 'anyProp', rule: 'required', message: 'This value is required' },
      ]),
    );
  });

  test('Should throw if the value should be string, but is not', async () => {
    const { sut } = makeSut();

    const sutResult = await sut
      .validate({
        schema: { anyProp: [sut.rules.string()] },
        model: { anyProp: 1 },
        data: { anyData: async () => [] },
      })
      .catch((e) => e);

    expect(sutResult).toStrictEqual(
      new ValidationException([
        { field: 'anyProp', rule: 'string', message: 'This value must be a string' },
      ]),
    );
  });

  describe('Should throw if the value should match with a regex, but is not', () => {
    test('regex: name', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.regex({ pattern: 'name' })] },
          model: { anyProp: ' iNv@l1 -_- n@m3 ' },
          data: { anyData: async () => [] },
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
          data: { anyData: async () => [] },
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

    test('regex: custom', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.regex({ pattern: 'custom', customPattern: /customPattern/ })],
          },
          model: { anyProp: 'invalid_custom' },
          data: { anyData: async () => [] },
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
  });

  test('Should throw if the value is out of length', async () => {
    const { sut } = makeSut();

    const sutResult = await sut
      .validate({
        schema: { anyProp: [sut.rules.length({ minLength: 2, maxLength: 3 })] },
        model: { anyProp: '1' },
        data: { anyData: async () => [] },
      })
      .catch((e) => e);

    expect(sutResult).toStrictEqual(
      new ValidationException([
        { field: 'anyProp', rule: 'length', message: 'This value length must be beetween 2 and 3' },
      ]),
    );
  });

  test('Should throw if the value has already been used', async () => {
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
        data: { anyData: async () => [{ anyProp: 'anyProp' }] },
      })
      .catch((e) => e);

    expect(sutResult).toStrictEqual(
      new ValidationException([
        { field: 'anyProp', rule: 'unique', message: 'This value has already been used' },
      ]),
    );
  });
});
