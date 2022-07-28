import { ValidationService } from '@/data/contracts/services';
import { RemoveProductValidation } from '@/data/contracts/validations';
import { RemoveProductUseCase } from '@/domain/use-cases';
import { ValidationBuilder } from '@/main/builders';

export function makeRemoveProductValidation(
  validationService: ValidationService.Validator,
): RemoveProductValidation {
  return async (requestModel: RemoveProductUseCase.RequestModel) => {
    await validationService.validate({
      schema: {
        id: new ValidationBuilder().required().string().regex({ pattern: 'uuidV4' }).build(),
      },
      model: requestModel,
      data: {},
    });
    return (validationData) =>
      validationService.validate({
        schema: {
          id: new ValidationBuilder()
            .exists({ dataEntity: 'products', props: [{ modelKey: 'id', dataKey: 'id' }] })
            .build(),
        },
        model: requestModel,
        data: validationData,
      });
  };
}
