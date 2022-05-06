import { ValidationException } from '@/infra/exceptions';
import { VanillaValidatorService } from '@/infra/services/validator';

function makeSut() {
  const sut = new VanillaValidatorService();

  return { sut };
}

describe(VanillaValidatorService.name, () => {
  test('Should throw if a required field was not informed', async () => {
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
});
