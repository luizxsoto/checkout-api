import { maxPerPage, minPerPage } from '@/data/constants';
import { ListUserRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { ListUserUseCase } from '@/domain/use-cases';

export class DbListUserUseCase implements ListUserUseCase.UseCase {
  constructor(
    private readonly listUserRepository: ListUserRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      ListUserUseCase.RequestModel,
      Record<string, unknown[]>
    >,
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
    await this.validatorService.validate({
      schema: {
        page: [
          this.validatorService.rules.integer(),
          this.validatorService.rules.min({ value: 1 }),
        ],
        perPage: [
          this.validatorService.rules.integer(),
          this.validatorService.rules.min({ value: minPerPage }),
          this.validatorService.rules.max({ value: maxPerPage }),
        ],
        orderBy: [
          this.validatorService.rules.string(),
          this.validatorService.rules.in({ values: ['name', 'email', 'createdAt', 'updatedAt'] }),
        ],
        order: [
          this.validatorService.rules.string(),
          this.validatorService.rules.in({ values: ['asc', 'desc'] }),
        ],
        filters: [
          this.validatorService.rules.listFilters<
            Omit<UserModel, 'id' | 'password' | 'roles' | 'deleteUserId' | 'deletedAt'>
          >({
            schema: {
              name: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'name' }),
                    this.validatorService.rules.length({ minLength: 6, maxLength: 100 }),
                  ],
                }),
              ],
              email: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'email' }),
                    this.validatorService.rules.length({ minLength: 6, maxLength: 100 }),
                  ],
                }),
              ],
              createUserId: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              updateUserId: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              createdAt: [
                this.validatorService.rules.array({
                  rules: [this.validatorService.rules.string(), this.validatorService.rules.date()],
                }),
              ],
              updatedAt: [
                this.validatorService.rules.array({
                  rules: [this.validatorService.rules.string(), this.validatorService.rules.date()],
                }),
              ],
            },
          }),
        ],
      },
      model: requestModel,
      data: {},
    });
  }
}
