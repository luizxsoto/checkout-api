import lodashGet from 'lodash.get'

import { ValidationService } from '@/data/contracts/services'
import { FieldValidation } from '@/validation/protocols'

export type Options = {
  validations: FieldValidation.Validation[]
}

export class Validator implements FieldValidation.Validation<Options> {
  constructor(
    public readonly options: Options,
    private readonly validationService: ValidationService.Validator
  ) {}

  public async validate({
    key,
    model,
    data,
  }: FieldValidation.Params): Promise<FieldValidation.Result> {
    const value = lodashGet(model, key)
    if (value === undefined) return null

    if (!Array.isArray(value))
      return { field: key, rule: 'array', message: 'This value must be an array' }

    await Promise.all(
      value.map((_, index) =>
        this.validationService.performValidation(
          this.options.validations,
          `${key}.${index}`,
          model,
          data
        )
      )
    )

    return null
  }
}
