import { ValidationService } from '@/data/contracts/services'
import { ShowUserValidation } from '@/data/contracts/validations'
import { SessionModel } from '@/domain/models'
import { ShowUserUseCase } from '@/domain/use-cases'
import { ValidationBuilder } from '@/main/builders'

export function makeShowUserValidation(
  validationService: ValidationService.Validator,
  session: SessionModel
): ShowUserValidation {
  return async (requestModel: ShowUserUseCase.RequestModel) => {
    await validationService.validate({
      schema: {
        id: new ValidationBuilder()
          .required()
          .string()
          .regex({ pattern: 'uuidV4' })
          .custom({
            validation: () =>
              session.roles.some((role) => role === 'admin') || requestModel.id === session.userId,
            rule: 'differentId',
            message: 'Only admin can show users different from himself'
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
            .build()
        },
        model: requestModel,
        data: validationData
      })
  }
}
