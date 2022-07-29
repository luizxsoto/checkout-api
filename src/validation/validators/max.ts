import lodashGet from 'lodash.get'

import { FieldValidation } from '@/validation/protocols'

export type Options = { value: number }

export class Validator implements FieldValidation.Validation<Options> {
  constructor(public readonly options: Options) {}

  public validate({ key, model }: FieldValidation.Params): FieldValidation.Result {
    const value = lodashGet(model, key) as number
    if (Number.isNaN(Number(value)) || value <= this.options.value) return null

    return {
      field: key,
      rule: 'max',
      message: `This value must be less or equal to: ${this.options.value}`,
    }
  }
}
