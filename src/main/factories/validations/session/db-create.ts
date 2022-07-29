import { HashComparer } from '@/data/contracts/cryptography'
import { ValidationService } from '@/data/contracts/services'
import { CreateSessionValidation } from '@/data/contracts/validations'
import { CreateSessionUseCase } from '@/domain/use-cases'
import { ValidationBuilder } from '@/main/builders'
import {
  MAX_USER_EMAIL_LENGTH,
  MAX_USER_PASSWORD_LENGTH,
  MIN_USER_EMAIL_LENGTH,
  MIN_USER_PASSWORD_LENGTH,
} from '@/main/constants'

export function makeCreateSessionValidation(
  validationService: ValidationService.Validator,
  hashComparer: HashComparer
): CreateSessionValidation {
  return async (requestModel: CreateSessionUseCase.RequestModel) => {
    await validationService.validate({
      schema: {
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
      },
      model: requestModel,
      data: {},
    })
    return async (validationData) => {
      await validationService.validate({
        schema: {
          email: new ValidationBuilder()
            .exists({ dataEntity: 'users', props: [{ modelKey: 'email', dataKey: 'email' }] })
            .build(),
        },
        model: requestModel,
        data: validationData,
      })
      return (findedUser) =>
        validationService.validate({
          schema: {
            password: new ValidationBuilder()
              .custom({
                validation: () => hashComparer.compare(requestModel.password, findedUser.password),
                rule: 'password',
                message: 'Wrong password',
              })
              .build(),
          },
          model: requestModel,
          data: validationData,
        })
    }
  }
}
