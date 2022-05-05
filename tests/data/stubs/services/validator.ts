import { ValidatorService } from '@/data/contracts/services';

export function makeValidatorServiceStub<
  Model,
  ValidatorData extends Record<string, () => Promise<any[]>>,
>() {
  return {
    rules: <ValidatorService.Rules>{
      required: (options) => ({ name: 'required', options }),
      string: (options) => ({ name: 'string', options }),
      email: (options) => ({ name: 'email', options }),
      unique: (options) => ({ name: 'unique', options }),
    },
    validate: jest
      .fn()
      .mockImplementation(
        (params: ValidatorService.Params<Model, ValidatorData>): ValidatorService.Result => {
          //
        },
      ),
  };
}
