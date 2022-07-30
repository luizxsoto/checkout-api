import { ValidationService } from '@/data/contracts/services'
import { ShowOrderValidation } from '@/data/contracts/validations'
import { ShowOrderUseCase } from '@/domain/use-cases'
import { ValidationBuilder } from '@/main/builders'

export function makeShowOrderValidation(
  validationService: ValidationService.Validator
): ShowOrderValidation {
  return async (requestModel: ShowOrderUseCase.RequestModel) => {
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
            .exists({ dataEntity: 'orders', props: [{ modelKey: 'id', dataKey: 'id' }] })
            .build()
        },
        model: requestModel,
        data: validationData
      })
  }
}
