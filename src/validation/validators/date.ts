import lodashGet from 'lodash.get'

import { FieldValidation } from '@/validation/protocols'

export type Options = undefined

export class Validator implements FieldValidation.Validation<Options> {
  constructor(public readonly options?: Options) {}

  public validate({ key, model }: FieldValidation.Params): FieldValidation.Result {
    const value = lodashGet(model, key)
    if (value === undefined) return null

    const datePatterns = [
      /^(\d{3}[1-9]|\d{2}[1-9]\d)-([0][1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/,
      /^(\d{3}[1-9]|\d{2}[1-9]\d)-([0][1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])T([0-1]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3}Z$/
    ]
    const validationError = {
      field: key,
      rule: 'date',
      message: 'This value must be a valid date'
    }

    if (typeof value !== 'string' || !datePatterns.some((datePattern) => datePattern.test(value)))
      return validationError

    const [dateYear, dateMonth, dateDay] = new Date(value).toISOString().split(/-|T/)
    const [year, month, day] = value.split('-')

    if (dateYear !== year || dateMonth !== month || dateDay !== day) return validationError

    return null
  }
}
