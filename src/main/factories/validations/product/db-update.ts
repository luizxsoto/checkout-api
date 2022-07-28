import { ValidationService } from '@/data/contracts/services';
import { UpdateProductValidation } from '@/data/contracts/validations';
import { UpdateProductUseCase } from '@/domain/use-cases';
import { ValidationBuilder } from '@/main/builders';
import { MAX_INTEGER } from '@/main/constants';

export function makeUpdateProductValidation(
  validationService: ValidationService.Validator,
): UpdateProductValidation {
  return async (requestModel: UpdateProductUseCase.RequestModel) => {
    await validationService.validate({
      schema: {
        id: new ValidationBuilder().required().string().regex({ pattern: 'uuidV4' }).build(),
        name: new ValidationBuilder().string().length({ minLength: 6, maxLength: 255 }).build(),
        category: new ValidationBuilder()
          .string()
          .in({ values: ['clothes', 'shoes', 'others'] })
          .build(),
        image: new ValidationBuilder().string().regex({ pattern: 'url' }).build(),
        price: new ValidationBuilder().integer().max({ value: MAX_INTEGER }).build(),
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
