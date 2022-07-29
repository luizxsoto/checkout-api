import { FieldValidation } from '@/validation/protocols'

export type Options = { validation: () => Promise<boolean>; rule: string; message: string }

export class Validator implements FieldValidation.Validation<Options> {
  constructor(public readonly options: Options) {}

  public async validate({ key }: FieldValidation.Params): Promise<FieldValidation.Result> {
    if (await this.options.validation()) return null

    return {
      field: key,
      rule: this.options.rule,
      message: this.options.message,
    }
  }
}
