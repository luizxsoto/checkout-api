import { maxPerPage, minPerPage } from '@/data/constants';
import { ListCustomerRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { CustomerModel } from '@/domain/models';
import { ListCustomerUseCase } from '@/domain/use-cases';

export class DbListCustomerUseCase implements ListCustomerUseCase.UseCase {
  constructor(
    private readonly listCustomerRepository: ListCustomerRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      ListCustomerUseCase.RequestModel,
      { customers: CustomerModel[] }
    >,
  ) {}

  public async execute(
    requestModel: ListCustomerUseCase.RequestModel,
  ): Promise<ListCustomerUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    await this.validateRequestModel(sanitizedRequestModel);

    const customersBy = await this.listCustomerRepository.list(sanitizedRequestModel);

    return customersBy;
  }

  private sanitizeRequestModel(
    requestModel: ListCustomerUseCase.RequestModel,
  ): ListCustomerUseCase.RequestModel {
    const sanitizedRequestModel: ListCustomerUseCase.RequestModel = {
      page: Number(requestModel.page) || requestModel.page,
      perPage: Number(requestModel.perPage) || requestModel.perPage,
      orderBy: requestModel.orderBy,
      order: requestModel.order,
      filters: requestModel.filters,
    };

    return sanitizedRequestModel;
  }

  private async validateRequestModel(
    requestModel: ListCustomerUseCase.RequestModel,
  ): Promise<void> {
    await this.validatorService.validate({
      schema: {
        page: [this.validatorService.rules.number(), this.validatorService.rules.min({ value: 1 })],
        perPage: [
          this.validatorService.rules.number(),
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
            Omit<
              CustomerModel,
              'id' | 'password' | 'roles' | 'createdAt' | 'updatedAt' | 'deletedAt'
            >
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
            },
          }),
        ],
      },
      model: requestModel,
      data: { customers: [] },
    });
  }
}
