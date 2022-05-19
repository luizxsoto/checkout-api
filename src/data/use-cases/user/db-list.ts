import { maxPerPage, minPerPage } from '@/data/constants';
import { ListUserRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { ListUserUseCase } from '@/domain/use-cases';

export class DbListUserUseCase implements ListUserUseCase.UseCase {
  constructor(
    private readonly listUserRepository: ListUserRepository.Repository,
    private readonly validator: ValidatorService.Validator<
      ListUserUseCase.RequestModel,
      { users: UserModel[] }
    >,
  ) {}

  public async execute(
    requestModel: ListUserUseCase.RequestModel,
  ): Promise<ListUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    await this.validateRequestModel(sanitizedRequestModel);

    const usersBy = await this.listUserRepository.list(sanitizedRequestModel);

    return usersBy;
  }

  private sanitizeRequestModel(
    requestModel: ListUserUseCase.RequestModel,
  ): ListUserUseCase.RequestModel {
    const sanitizedRequestModel: ListUserUseCase.RequestModel = {
      page: Number(requestModel.page) || requestModel.page,
      perPage: Number(requestModel.perPage) || requestModel.perPage,
      orderBy: requestModel.orderBy,
      order: requestModel.order,
    };

    if (requestModel.name) sanitizedRequestModel.name = requestModel.name;
    if (requestModel.email) sanitizedRequestModel.email = requestModel.email;

    return sanitizedRequestModel;
  }

  private async validateRequestModel(requestModel: ListUserUseCase.RequestModel): Promise<void> {
    await this.validator.validate({
      schema: {
        page: [this.validator.rules.number(), this.validator.rules.min({ value: 1 })],
        perPage: [
          this.validator.rules.number(),
          this.validator.rules.min({ value: minPerPage }),
          this.validator.rules.max({ value: maxPerPage }),
        ],
        orderBy: [
          this.validator.rules.string(),
          this.validator.rules.in({ values: ['name', 'email', 'createdAt', 'updatedAt'] }),
        ],
        order: [
          this.validator.rules.string(),
          this.validator.rules.in({ values: ['asc', 'desc'] }),
        ],
        name: [
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'name' }),
          this.validator.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'email' }),
          this.validator.rules.length({ minLength: 6, maxLength: 100 }),
        ],
      },
      model: requestModel,
      data: { users: [] },
    });
  }
}
