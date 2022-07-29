import { ValidationService } from '@/data/contracts/services'
import { ListOrderValidation } from '@/data/contracts/validations'
import { ListOrderUseCase } from '@/domain/use-cases'
import { ValidationBuilder } from '@/main/builders'
import { MAX_INTEGER, MAX_PER_PAGE, MIN_PER_PAGE } from '@/main/constants'
import { ArrayValidation, ObjectValidation } from '@/validation/validators'

export function makeListOrderValidation(
  validationService: ValidationService.Validator
): ListOrderValidation {
  return async (requestModel: ListOrderUseCase.RequestModel) => {
    const filtersSchema: Record<string, [ArrayValidation.Validator]> = {
      userId: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().regex({ pattern: 'uuidV4' }).build() },
          validationService
        ),
      ],
      totalValue: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().integer().max({ value: MAX_INTEGER }).build() },
          validationService
        ),
      ],
      createUserId: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().regex({ pattern: 'uuidV4' }).build() },
          validationService
        ),
      ],
      updateUserId: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().regex({ pattern: 'uuidV4' }).build() },
          validationService
        ),
      ],
      createdAt: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().date().build() },
          validationService
        ),
      ],
      updatedAt: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().date().build() },
          validationService
        ),
      ],
    }

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
          .in({ values: ['userId', 'totalValue', 'createdAt', 'updatedAt'] })
          .build(),
        order: new ValidationBuilder()
          .string()
          .in({ values: ['asc', 'desc'] })
          .build(),
        filters: new ValidationBuilder()
          .listFilers(
            { schema: filtersSchema },
            new ObjectValidation.Validator({ schema: filtersSchema }, validationService)
          )
          .build(),
      },
      model: requestModel,
      data: {},
    })
  }
}
