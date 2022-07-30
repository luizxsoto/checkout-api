import lodashGet from 'lodash.get'

import { FieldValidation } from '@/validation/protocols'

export type Options = {
  pattern: 'custom' | 'name' | 'email' | 'password' | 'uuidV4' | 'url'
  customPattern?: RegExp
}

export class Validator implements FieldValidation.Validation<Options> {
  constructor(public readonly options: Options) {}

  public validate({ key, model }: FieldValidation.Params): FieldValidation.Result {
    const value = lodashGet(model, key)
    if (value === undefined) return null

    const regexDict = {
      custom: this.options.customPattern ?? /^\w$/,
      name: /^([a-zA-Z\u00C0-\u00FF]+\s)*[a-zA-Z\u00C0-\u00FF]+$/,
      email: /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/,
      password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      uuidV4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      url: /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi
    }

    if (typeof value !== 'string' || !regexDict[this.options.pattern].test(value))
      return {
        field: key,
        rule: 'regex',
        message: `This value must be valid according to the pattern: ${this.options.pattern}`,
        details: { pattern: String(regexDict[this.options.pattern]) }
      }

    return null
  }
}
