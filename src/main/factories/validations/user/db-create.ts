import { ValidationService } from '@/data/contracts/services';
import { CreateUserValidation } from '@/data/contracts/validations';
import { CreateUserUseCase } from '@/domain/use-cases';
import { ValidationBuilder } from '@/main/builders';

export function makeCreateUserValidation(
  validationService: ValidationService.Validator,
): CreateUserValidation {
  return async (requestModel: CreateUserUseCase.RequestModel) => {
    await validationService.validate({
      schema: {
        name: new ValidationBuilder()
          .required()
          .string()
          .regex({ pattern: 'name' })
          .length({ minLength: 6, maxLength: 100 })
          .build(),
        email: new ValidationBuilder()
          .required()
          .string()
          .regex({ pattern: 'email' })
          .length({ minLength: 6, maxLength: 100 })
          .build(),
        password: new ValidationBuilder()
          .required()
          .string()
          .regex({ pattern: 'password' })
          .length({ minLength: 6, maxLength: 20 })
          .build(),
        roles: new ValidationBuilder()
          .required()
          .array(
            {
              validations: new ValidationBuilder()
                .string()
                .in({ values: ['admin', 'moderator'] })
                .build(),
            },
            validationService,
          )
          .distinct()
          .build(),
      },
      model: requestModel,
      data: {},
    });
    return (validationData) =>
      validationService.validate({
        schema: {
          email: new ValidationBuilder()
            .unique({ dataEntity: 'users', props: [{ modelKey: 'email', dataKey: 'email' }] })
            .build(),
        },
        model: requestModel,
        data: validationData,
      });
  };
}
