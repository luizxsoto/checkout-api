import { VanillaValidatorService } from '@/infra/services/validator';
import { ValidationException } from '@/main/exceptions';

function makeSut() {
  const sut = new VanillaValidatorService();

  return { sut };
}

describe(VanillaValidatorService.name, () => {
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

    test('Should not throw if no value is provided', async () => {
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

    test('Should not throw if no value is provided', async () => {
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
