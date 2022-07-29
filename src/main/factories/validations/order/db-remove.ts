import { ValidationService } from '@/data/contracts/services'
import { RemoveOrderValidation } from '@/data/contracts/validations'
import { RemoveOrderUseCase } from '@/domain/use-cases'
import { ValidationBuilder } from '@/main/builders'

export function makeRemoveOrderValidation(
  validationService: ValidationService.Validator
): RemoveOrderValidation {
  return async (requestModel: RemoveOrderUseCase.RequestModel) => {
    await validationService.validate({
      schema: {
        id: new ValidationBuilder().required().string().regex({ pattern: 'uuidV4' }).build(),
      },
      model: requestModel,
      data: {},
    })
    return (validationData) =>
      validationService.validate({
        schema: {
          id: new ValidationBuilder()
            .exists({ dataEntity: 'orders', props: [{ modelKey: 'id', dataKey: 'id' }] })
            .build(),
        },
        model: requestModel,
        data: validationData,
      })
  }
}
