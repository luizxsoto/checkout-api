import { ValidationService } from '@/data/contracts/services';
import { RemoveUserValidation } from '@/data/contracts/validations';
import { RemoveUserUseCase } from '@/domain/use-cases';
import { ValidationBuilder } from '@/main/builders';

export function makeRemoveUserValidation(
  validationService: ValidationService.Validator,
): RemoveUserValidation {
  return async (requestModel: RemoveUserUseCase.RequestModel) => {
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
            .exists({ dataEntity: 'users', props: [{ modelKey: 'id', dataKey: 'id' }] })
            .build(),
        },
        model: requestModel,
        data: validationData,
      });
  };
}
