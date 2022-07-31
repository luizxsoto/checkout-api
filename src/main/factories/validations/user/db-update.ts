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
        id: new ValidationBuilder().required().string().regex({ pattern: 'uuidV4' }).build(),
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
        roles: new ValidationBuilder()
          .array(
            {
              validations: new ValidationBuilder()
                .string()
                .in({ values: ['admin', 'moderator'] })
                .build()
            },
            validationService
          )
          .distinct()
          .custom({
            validation: () =>
              !requestModel.roles ||
              !requestModel.roles.length ||
              session.roles.some((role) => role === 'admin'),
            rule: 'role',
            message:
              'Only an admin can provide a filled role array, otherwise provide an empty array'
          })
          .build()
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
