import { ValidationService } from '@/data/contracts/services'
import { ListUserValidation } from '@/data/contracts/validations'
import { ListUserUseCase } from '@/domain/use-cases'
import { ValidationBuilder } from '@/main/builders'
import {
  MAX_PER_PAGE,
  MAX_USER_EMAIL_LENGTH,
  MAX_USER_NAME_LENGTH,
  MIN_PER_PAGE,
  MIN_USER_EMAIL_LENGTH,
  MIN_USER_NAME_LENGTH
} from '@/main/constants'
import { ArrayValidation, ObjectValidation } from '@/validation/validators'

export function makeListUserValidation(
  validationService: ValidationService.Validator
): ListUserValidation {
  return async (requestModel: ListUserUseCase.RequestModel) => {
    const filtersSchema: Record<string, [ArrayValidation.Validator]> = {
      name: [
        new ArrayValidation.Validator(
          {
            validations: new ValidationBuilder()
              .string()
              .regex({ pattern: 'name' })
              .length({ minLength: MIN_USER_NAME_LENGTH, maxLength: MAX_USER_NAME_LENGTH })
              .build()
          },
          validationService
        )
      ],
      email: [
        new ArrayValidation.Validator(
          {
            validations: new ValidationBuilder()
              .string()
              .regex({ pattern: 'email' })
              .length({ minLength: MIN_USER_EMAIL_LENGTH, maxLength: MAX_USER_EMAIL_LENGTH })
              .build()
          },
          validationService
        )
      ],
      createUserId: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().regex({ pattern: 'uuidV4' }).build() },
          validationService
        )
      ],
      updateUserId: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().regex({ pattern: 'uuidV4' }).build() },
          validationService
        )
      ],
      createdAt: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().date().build() },
          validationService
        )
      ],
      updatedAt: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().date().build() },
          validationService
        )
      ]
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
          .in({ values: ['name', 'email', 'createdAt', 'updatedAt'] })
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
          .build()
      },
      model: requestModel,
      data: {}
    })
  }
}
