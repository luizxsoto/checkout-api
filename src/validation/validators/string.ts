import lodashGet from 'lodash.get';

import { FieldValidation } from '@/validation/protocols';

export type Options = undefined;

export class Validator implements FieldValidation.Validation<Options> {
  constructor(public readonly options?: Options) {}

  public validate({ key, model }: FieldValidation.Params): FieldValidation.Result {
    const value = lodashGet(model, key);
    if (value === undefined || typeof value === 'string') return null;

    return { field: key, rule: 'string', message: 'This value must be a string' };
  }
}
