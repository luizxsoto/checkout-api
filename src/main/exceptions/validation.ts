import { StatusCodes } from '@/main/constants'
import { ApplicationException } from '@/main/exceptions'

export interface ValidationItem {
  field: string
  rule: string
  message: string
}

export class ValidationException extends ApplicationException {
  constructor(private readonly validations: ValidationItem[]) {
    super({
      name: 'ValidationException',
      code: StatusCodes.BAD_REQUEST,
      message: 'An error ocurred performing a validation',
    })
  }
}
