import { ValidationService } from '@/data/contracts/services';
import { UpdateUserValidation } from '@/data/contracts/validations';
import { UpdateUserUseCase } from '@/domain/use-cases';
import { ValidationBuilder } from '@/main/builders';

export function makeUpdateUserValidation(
  validationService: ValidationService.Validator,
): UpdateUserValidation {
  return async (requestModel: UpdateUserUseCase.RequestModel) => {
    await validationService.validate({
      schema: {
        id: new ValidationBuilder().required().string().regex({ pattern: 'uuidV4' }).build(),
        name: new ValidationBuilder()
          .string()
          .regex({ pattern: 'name' })
          .length({ minLength: 6, maxLength: 100 })
          .build(),
        email: new ValidationBuilder()
          .string()
          .regex({ pattern: 'email' })
          .length({ minLength: 6, maxLength: 100 })
          .build(),
        password: new ValidationBuilder()
          .string()
          .regex({ pattern: 'password' })
          .length({ minLength: 6, maxLength: 20 })
          .build(),
        roles: new ValidationBuilder()
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
          id: new ValidationBuilder()
            .exists({ dataEntity: 'users', props: [{ modelKey: 'id', dataKey: 'id' }] })
            .build(),
          email: new ValidationBuilder()
            .unique({
              dataEntity: 'users',
              ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
              props: [{ modelKey: 'email', dataKey: 'email' }],
            })
            .build(),
        },
        model: requestModel,
        data: validationData,
      });
  };
}
