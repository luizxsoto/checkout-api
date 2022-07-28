import { ValidationService } from '@/data/contracts/services';
import { CreateProductValidation } from '@/data/contracts/validations';
import { CreateProductUseCase } from '@/domain/use-cases';
import { ValidationBuilder } from '@/main/builders';
import { MAX_INTEGER } from '@/main/constants';

export function makeCreateProductValidation(
  validationService: ValidationService.Validator,
): CreateProductValidation {
  return async (requestModel: CreateProductUseCase.RequestModel) => {
    await validationService.validate({
      schema: {
        name: new ValidationBuilder()
          .required()
          .string()
          .length({ minLength: 6, maxLength: 255 })
          .build(),
        category: new ValidationBuilder()
          .required()
          .string()
          .in({ values: ['clothes', 'shoes', 'others'] })
          .build(),
        image: new ValidationBuilder().required().string().regex({ pattern: 'url' }).build(),
        price: new ValidationBuilder().required().integer().max({ value: MAX_INTEGER }).build(),
      },
      model: requestModel,
      data: {},
    });
  };
}
