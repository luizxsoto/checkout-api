import { ValidationService } from '@/data/contracts/services'
import { ShowProductValidation } from '@/data/contracts/validations'
import { ShowProductUseCase } from '@/domain/use-cases'
import { ValidationBuilder } from '@/main/builders'

export function makeShowProductValidation(
  validationService: ValidationService.Validator
): ShowProductValidation {
  return async (requestModel: ShowProductUseCase.RequestModel) => {
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
            .exists({ dataEntity: 'products', props: [{ modelKey: 'id', dataKey: 'id' }] })
            .build()
        },
        model: requestModel,
        data: validationData
      })
  }
}
