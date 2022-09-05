import { ValidationService } from '@/data/contracts/services'
import { UpdateUserValidation } from '@/data/contracts/validations'
import { SessionModel } from '@/domain/models'
import { UpdateUserUseCase } from '@/domain/use-cases'
import { ValidationBuilder } from '@/main/builders'
import {
  MAX_USER_EMAIL_LENGTH,
  MAX_USER_NAME_LENGTH,
  MAX_USER_PASSWORD_LENGTH,
  MIN_USER_EMAIL_LENGTH,
  MIN_USER_NAME_LENGTH,
  MIN_USER_PASSWORD_LENGTH
} from '@/main/constants'

export function makeUpdateUserValidation(
  validationService: ValidationService.Validator,
  session: SessionModel
): UpdateUserValidation {
  return async (requestModel: UpdateUserUseCase.RequestModel) => {
    await validationService.validate({
      schema: {
        id: new ValidationBuilder()
          .required()
          .string()
          .regex({ pattern: 'uuidV4' })
          .custom({
            validation: () => session.role === 'admin' || requestModel.id === session.userId,
            rule: 'differentId',
            message: 'Only admin can update users different from himself'
          })
          .build(),
        name: new ValidationBuilder()
          .string()
          .regex({ pattern: 'name' })
          .length({ minLength: MIN_USER_NAME_LENGTH, maxLength: MAX_USER_NAME_LENGTH })
          .build(),
        email: new ValidationBuilder()
          .string()
          .regex({ pattern: 'email' })
          .length({ minLength: MIN_USER_EMAIL_LENGTH, maxLength: MAX_USER_EMAIL_LENGTH })
          .build(),
        password: new ValidationBuilder()
          .string()
          .regex({ pattern: 'password' })
          .length({ minLength: MIN_USER_PASSWORD_LENGTH, maxLength: MAX_USER_PASSWORD_LENGTH })
          .build(),
        role: new ValidationBuilder()
          .string()
          .in({ values: ['admin', 'moderator', 'customer'] })
          .custom({
            validation: () => requestModel.role === 'customer' || session?.role === 'admin',
            rule: 'filledRole',
            message: 'Only an admin can provide a role different from customer'
          })
          .build(),
        image: new ValidationBuilder().string().regex({ pattern: 'url' }).build()
      },
      model: requestModel,
      data: {}
    })
    return (validationData) =>
      validationService.validate({
        schema: {
          id: new ValidationBuilder()
            .exists({ dataEntity: 'users', props: [{ modelKey: 'id', dataKey: 'id' }] })
            .build(),
          email: new ValidationBuilder()
            .unique({
              dataEntity: 'users',
              ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
              props: [{ modelKey: 'email', dataKey: 'email' }]
            })
            .build()
        },
        model: requestModel,
        data: validationData
      })
  }
}
