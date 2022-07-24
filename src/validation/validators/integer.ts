import lodashGet from 'lodash.get';

import { FieldValidation } from '@/validation/protocols';

export type Options = undefined;

export class Validator implements FieldValidation.Validation<Options> {
  constructor(public readonly options?: Options) {}

  public validate({ key, model }: FieldValidation.Params): FieldValidation.Result {
    const value = lodashGet(model, key);
    const integerRgx = /^\d*$/;
    if (value === undefined || (typeof value === 'number' && integerRgx.test(String(value))))
      return null;

    return {
      field: key as string,
      rule: 'integer',
      message: 'This value must be an integer',
    };
  }
}
