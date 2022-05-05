/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { ValidatorService } from '@/data/contracts/services';
import { Rules } from '@/data/contracts/services/validator';
import { ValidationException, ValidationItem } from '@/infra/exceptions';

export class VanillaValidatorService<
  Model,
  ValidatorData extends Record<string, () => Promise<any[]>>,
> implements ValidatorService.Validator<Model, ValidatorData>
{
  public async validate(
    params: ValidatorService.Params<Model, ValidatorData>,
  ): ValidatorService.Result {
    const validations: ValidationItem[] = [];

    for (const key of Object.keys(params.schema)) {
      const parsedKey = key as keyof Model;

      for (const rule of params.schema[parsedKey]) {
        const validation = await this.validationRules[rule.name](
          parsedKey,
          rule.options,
          params.model,
          params.data,
        );

        if (validation) {
          validations.push(validation);
          break;
        }
      }
    }

    if (validations.length) throw new ValidationException(validations);
  }

  public rules: ValidatorService.Rules = {
    required: (options) => ({ name: 'required', options }),
    string: (options) => ({ name: 'string', options }),
    email: (options) => ({ name: 'email', options }),
    unique: (options) => ({ name: 'unique', options }),
  };

  public validationRules: Record<
    keyof ValidatorService.Rules,
    (
      key: keyof Model,
      options: any,
      model: ValidatorService.Params<Model, ValidatorData>['model'],
      data: ValidatorService.Params<Model, ValidatorData>['data'],
    ) => null | ValidationItem | Promise<null | ValidationItem>
  > = {
    required: (key, _options, model) => {
      if (model[key]) return null;
      return {
        field: key as string,
        rule: 'required',
        message: 'This value is required',
      };
    },
    string: (key, options: Parameters<Rules['string']>[0], model) => {
      const response = {
        field: key as string,
        rule: 'string',
        message: 'This value must be a string',
      };

      if (typeof model[key] !== 'string') return response;
      const messages: string[] = [];

      if (options.minLength && (model[key] as unknown as string)?.length < options.minLength)
        messages.push(`higher than ${options.minLength}`);

      if (options.maxLength && (model[key] as unknown as string)?.length > options.maxLength)
        messages.push(`lower than ${options.maxLength}`);

      if (!messages.length) return null;

      response.message += ` ${messages.join(' and ')}`;

      return response;
    },
    email: (key, _options, model) => {
      const emailRgx = /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/;

      if (
        !model[key] ||
        typeof model[key] !== 'string' ||
        emailRgx.test(model[key] as unknown as string)
      )
        return null;

      return {
        field: key as string,
        rule: 'email',
        message: 'This value must be a valid email',
      };
    },
    unique: async (key, options: Parameters<Rules['unique']>[0], model, data) => {
      const hasItem = (await data[options.dataEntity]()).some((dataItem) =>
        options.props?.every(
          (prop) => dataItem[prop.dataKey] === model[prop.modelKey as keyof Model],
        ),
      );

      if (!hasItem) return null;

      return {
        field: key as string,
        rule: 'unique',
        message: 'This value is already used',
      };
    },
  };
}
