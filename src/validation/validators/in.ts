import lodashGet from 'lodash.get'

import { FieldValidation } from '@/validation/protocols'

export type Options = {
  values: (string | number)[]
}

export class Validator implements FieldValidation.Validation<Options> {
  constructor(public readonly options: Options) {}

  public validate({ key, model }: FieldValidation.Params): FieldValidation.Result {
    const value = lodashGet(model, key)
    if (value === undefined || this.options.values.includes(value as string | number)) return null

    return {
      field: key,
      rule: 'in',
      message: `This value must be in: ${this.options.values.join(', ')}`
    }
  }
}
