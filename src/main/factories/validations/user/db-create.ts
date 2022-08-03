import { ValidationService } from '@/data/contracts/services'
import { CreateUserValidation } from '@/data/contracts/validations'
import { SessionModel } from '@/domain/models'
import { CreateUserUseCase } from '@/domain/use-cases'
import { ValidationBuilder } from '@/main/builders'
import {
  MAX_USER_EMAIL_LENGTH,
  MAX_USER_NAME_LENGTH,
  MAX_USER_PASSWORD_LENGTH,
  MIN_USER_EMAIL_LENGTH,
  MIN_USER_NAME_LENGTH,
  MIN_USER_PASSWORD_LENGTH
} from '@/main/constants'

export function makeCreateUserValidation(
  validationService: ValidationService.Validator,
  session?: SessionModel
): CreateUserValidation {
  return async (requestModel: CreateUserUseCase.RequestModel) => {
    await validationService.validate({
      schema: {
        name: new ValidationBuilder()
          .required()
          .string()
          .regex({ pattern: 'name' })
          .length({ minLength: MIN_USER_NAME_LENGTH, maxLength: MAX_USER_NAME_LENGTH })
          .build(),
        email: new ValidationBuilder()
          .required()
          .string()
          .regex({ pattern: 'email' })
          .length({ minLength: MIN_USER_EMAIL_LENGTH, maxLength: MAX_USER_EMAIL_LENGTH })
          .build(),
        password: new ValidationBuilder()
          .required()
          .string()
          .regex({ pattern: 'password' })
          .length({ minLength: MIN_USER_PASSWORD_LENGTH, maxLength: MAX_USER_PASSWORD_LENGTH })
          .build(),
        role: new ValidationBuilder()
          .required()
          .string()
          .in({ values: ['admin', 'moderator', 'customer'] })
          .custom({
            validation: () => requestModel.role === 'customer' || session?.role === 'admin',
            rule: 'filledRole',
            message: 'Only an admin can provide a role different from customer'
          })
          .build()
      },
      model: requestModel,
      data: {}
    })
    return (validationData) =>
      validationService.validate({
        schema: {
          email: new ValidationBuilder()
            .unique({ dataEntity: 'users', props: [{ modelKey: 'email', dataKey: 'email' }] })
            .build()
        },
        model: requestModel,
        data: validationData
      })
  }
}
