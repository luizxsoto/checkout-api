import { ValidationService } from '@/data/contracts/services';
import { UpdateOrderValidation } from '@/data/contracts/validations';
import { UpdateOrderUseCase } from '@/domain/use-cases';
import { ValidationBuilder } from '@/main/builders';

export function makeUpdateOrderValidation(
  validationService: ValidationService.Validator,
): UpdateOrderValidation {
  return async (requestModel: UpdateOrderUseCase.RequestModel) => {
    await validationService.validate({
      schema: {
        id: new ValidationBuilder().required().string().regex({ pattern: 'uuidV4' }).build(),
        userId: new ValidationBuilder().required().string().regex({ pattern: 'uuidV4' }).build(),
      },
      model: requestModel,
      data: {},
    });
    return (validationData) =>
      validationService.validate({
        schema: {
          id: new ValidationBuilder()
            .exists({ dataEntity: 'orders', props: [{ modelKey: 'id', dataKey: 'id' }] })
            .build(),
          userId: new ValidationBuilder()
            .exists({ dataEntity: 'users', props: [{ modelKey: 'userId', dataKey: 'id' }] })
            .build(),
        },
        model: requestModel,
        data: validationData,
      });
  };
}
