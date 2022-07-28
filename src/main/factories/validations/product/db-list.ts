import { ValidationService } from '@/data/contracts/services';
import { ListProductValidation } from '@/data/contracts/validations';
import { ListProductUseCase } from '@/domain/use-cases';
import { ValidationBuilder } from '@/main/builders';
import { MAX_INTEGER, MAX_PER_PAGE, MIN_PER_PAGE } from '@/main/constants';
import { ArrayValidation, ObjectValidation } from '@/validation/validators';

export function makeListProductValidation(
  validationService: ValidationService.Validator,
): ListProductValidation {
  return async (requestModel: ListProductUseCase.RequestModel) => {
    const filtersSchema: Record<string, [ArrayValidation.Validator]> = {
      name: [
        new ArrayValidation.Validator(
          {
            validations: new ValidationBuilder()
              .string()
              .length({ minLength: 6, maxLength: 255 })
              .build(),
          },
          validationService,
        ),
      ],
      category: [
        new ArrayValidation.Validator(
          {
            validations: new ValidationBuilder()
              .string()
              .in({ values: ['clothes', 'shoes', 'others'] })
              .build(),
          },
          validationService,
        ),
      ],
      price: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().integer().max({ value: MAX_INTEGER }).build() },
          validationService,
        ),
      ],
      createUserId: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().regex({ pattern: 'uuidV4' }).build() },
          validationService,
        ),
      ],
      updateUserId: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().regex({ pattern: 'uuidV4' }).build() },
          validationService,
        ),
      ],
      createdAt: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().date().build() },
          validationService,
        ),
      ],
      updatedAt: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().date().build() },
          validationService,
        ),
      ],
    };

    await validationService.validate({
      schema: {
        page: new ValidationBuilder().integer().min({ value: 1 }).build(),
        perPage: new ValidationBuilder()
          .integer()
          .min({ value: MIN_PER_PAGE })
          .max({ value: MAX_PER_PAGE })
          .build(),
        orderBy: new ValidationBuilder()
          .string()
          .in({ values: ['name', 'category', 'price', 'createdAt', 'updatedAt'] })
          .build(),
        order: new ValidationBuilder()
          .string()
          .in({ values: ['asc', 'desc'] })
          .build(),
        filters: new ValidationBuilder()
          .listFilers(
            { schema: filtersSchema },
            new ObjectValidation.Validator({ schema: filtersSchema }, validationService),
          )
          .build(),
      },
      model: requestModel,
      data: {},
    });
  };
}
