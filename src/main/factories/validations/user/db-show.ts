import { ValidationService } from '@/data/contracts/services'
import { ShowUserValidation } from '@/data/contracts/validations'
import { ShowUserUseCase } from '@/domain/use-cases'
import { ValidationBuilder } from '@/main/builders'

export function makeShowUserValidation(
  validationService: ValidationService.Validator
): ShowUserValidation {
  return async (requestModel: ShowUserUseCase.RequestModel) => {
    await validationService.validate({
      schema: {
        id: new ValidationBuilder().required().string().regex({ pattern: 'uuidV4' }).build()
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
