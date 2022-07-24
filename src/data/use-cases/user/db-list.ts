import { MAX_PER_PAGE, MIN_PER_PAGE } from '@/data/constants';
import { ListUserRepository } from '@/data/contracts/repositories';
import { ValidationService } from '@/data/contracts/services';
import { ListUserUseCase } from '@/domain/use-cases';
import { ValidationBuilder } from '@/main/builders';
import { ArrayValidation, ObjectValidation } from '@/validation/validators';

export class DbListUserUseCase implements ListUserUseCase.UseCase {
  constructor(
    private readonly listUserRepository: ListUserRepository.Repository,
    private readonly validationService: ValidationService.Validator,
  ) {}

  public async execute(
    requestModel: ListUserUseCase.RequestModel,
  ): Promise<ListUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    await this.validateRequestModel(sanitizedRequestModel);

    const users = await this.listUserRepository.list(sanitizedRequestModel);

    return users;
  }

  private sanitizeRequestModel(
    requestModel: ListUserUseCase.RequestModel,
  ): ListUserUseCase.RequestModel {
    const sanitizedRequestModel: ListUserUseCase.RequestModel = {
      page: Number(requestModel.page) || requestModel.page,
      perPage: Number(requestModel.perPage) || requestModel.perPage,
      orderBy: requestModel.orderBy,
      order: requestModel.order,
      filters: requestModel.filters,
    };

    return sanitizedRequestModel;
  }

  private async validateRequestModel(requestModel: ListUserUseCase.RequestModel): Promise<void> {
    const filtersSchema: Record<string, [ArrayValidation.Validator]> = {
      name: [
        new ArrayValidation.Validator(
          {
            validations: new ValidationBuilder()
              .string()
              .regex({ pattern: 'name' })
              .length({ minLength: 6, maxLength: 100 })
              .build(),
          },
          this.validationService,
        ),
      ],
      email: [
        new ArrayValidation.Validator(
          {
            validations: new ValidationBuilder()
              .string()
              .regex({ pattern: 'email' })
              .length({ minLength: 6, maxLength: 100 })
              .build(),
          },
          this.validationService,
        ),
      ],
      createUserId: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().regex({ pattern: 'uuidV4' }).build() },
          this.validationService,
        ),
      ],
      updateUserId: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().regex({ pattern: 'uuidV4' }).build() },
          this.validationService,
        ),
      ],
      createdAt: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().date().build() },
          this.validationService,
        ),
      ],
      updatedAt: [
        new ArrayValidation.Validator(
          { validations: new ValidationBuilder().string().date().build() },
          this.validationService,
        ),
      ],
    };

    await this.validationService.validate({
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
            new ObjectValidation.Validator({ schema: filtersSchema }, this.validationService),
          )
          .build(),
      },
      model: requestModel,
      data: {},
    });
  }
}
