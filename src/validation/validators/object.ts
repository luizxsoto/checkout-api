import lodashGet from 'lodash.get';

import { ValidationService } from '@/data/contracts/services';
import { FieldValidation } from '@/validation/protocols';

export type Options = {
  schema: ValidationService.Schema;
};

export class Validator implements FieldValidation.Validation<Options> {
  constructor(
    public readonly options: Options,
    private readonly validationService: ValidationService.Validator,
  ) {}

  public async validate({
    key,
    model,
    data,
  }: FieldValidation.Params): Promise<FieldValidation.Result> {
    const value = lodashGet(model, key);
    if (value === undefined) return null;

    if (typeof value !== 'object' || Array.isArray(value))
      return {
        field: key as string,
        rule: 'object',
        message: 'This value must be an object',
      };

    const parsedSchema = {} as ValidationService.Schema;
    Object.keys(this.options.schema).forEach((nestedKey) => {
      parsedSchema[`${key}.${nestedKey}`] = this.options.schema[nestedKey];
    });

    await this.validationService.validate({ schema: parsedSchema, model, data });

    return null;
  }
}
