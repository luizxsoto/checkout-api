import { FieldValidation } from '@/validation/protocols'

export type Schema = Record<string, FieldValidation.Validation[]>

export type Params = {
  schema: Schema
  model: Record<string, unknown>
  data: Record<string, any[]>
}

export type Result = void

export interface Validator {
  performValidation(
    validations: FieldValidation.Validation[],
    key: string,
    model: Record<string, unknown>,
    data: Record<string, any[]>
  ): Promise<void>
  validate: (params: Params) => Promise<Result>
}
