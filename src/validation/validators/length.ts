import lodashGet from 'lodash.get'

import { FieldValidation } from '@/validation/protocols'

export type Options = { minLength: number; maxLength: number }

export class Validator implements FieldValidation.Validation<Options> {
  constructor(public readonly options: Options) {}

  public validate({ key, model }: FieldValidation.Params): FieldValidation.Result {
    const value = lodashGet(model, key)
    if (value === undefined || (typeof value !== 'string' && !Array.isArray(value))) return null

    if (value.length < this.options.minLength || value.length > this.options.maxLength) {
      return {
        field: key,
        rule: 'length',
        message: `This value length must be beetween ${this.options.minLength} and ${this.options.maxLength}`,
      }
    }

    return null
  }
}
