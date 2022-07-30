import lodashGet from 'lodash.get'

import { FieldValidation } from '@/validation/protocols'

export type Options = { keys: string[] }

export class Validator implements FieldValidation.Validation<Options> {
  constructor(public readonly options?: Options) {}

  public validate({ key, model }: FieldValidation.Params): FieldValidation.Result {
    const value = lodashGet(model, key)
    if (value === undefined || !Array.isArray(value)) return null

    const hasDuplicatedValue = value.some(
      (valueItem) =>
        value.filter((otherValueItem) =>
          !this.options?.keys
            ? valueItem === otherValueItem
            : this.options?.keys.every(
                (keyItem) => lodashGet(otherValueItem, keyItem) === lodashGet(valueItem, keyItem)
              )
        ).length > 1
    )

    if (!hasDuplicatedValue) return null

    return {
      field: key,
      rule: 'distinct',
      message: `This value cannot have duplicate items${
        !this.options?.keys ? '' : ` by: ${this.options?.keys.join(', ')}`
      }`
    }
  }
}
