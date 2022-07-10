import { MAX_PER_PAGE, MIN_PER_PAGE } from '@/data/constants';
import { ListProductRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { ProductModel } from '@/domain/models';
import { ListProductUseCase } from '@/domain/use-cases';
import { MAX_INTEGER } from '@/main/constants';

export class DbListProductUseCase implements ListProductUseCase.UseCase {
  constructor(
    private readonly listProductRepository: ListProductRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      ListProductUseCase.RequestModel,
      Record<string, unknown[]>
    >,
  ) {}

  public async execute(
    requestModel: ListProductUseCase.RequestModel,
  ): Promise<ListProductUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    await this.validateRequestModel(sanitizedRequestModel);

    const products = await this.listProductRepository.list(sanitizedRequestModel);

    return products;
  }

  private sanitizeRequestModel(
    requestModel: ListProductUseCase.RequestModel,
  ): ListProductUseCase.RequestModel {
    const sanitizedRequestModel: ListProductUseCase.RequestModel = {
      page: Number(requestModel.page) || requestModel.page,
      perPage: Number(requestModel.perPage) || requestModel.perPage,
      orderBy: requestModel.orderBy,
      order: requestModel.order,
      filters: requestModel.filters,
    };

    return sanitizedRequestModel;
  }

  private async validateRequestModel(requestModel: ListProductUseCase.RequestModel): Promise<void> {
    await this.validatorService.validate({
      schema: {
        page: [
          this.validatorService.rules.integer(),
          this.validatorService.rules.min({ value: 1 }),
        ],
        perPage: [
          this.validatorService.rules.integer(),
          this.validatorService.rules.min({ value: MIN_PER_PAGE }),
          this.validatorService.rules.max({ value: MAX_PER_PAGE }),
        ],
        orderBy: [
          this.validatorService.rules.string(),
          this.validatorService.rules.in({
            values: ['name', 'category', 'price', 'createdAt', 'updatedAt'],
          }),
        ],
        order: [
          this.validatorService.rules.string(),
          this.validatorService.rules.in({ values: ['asc', 'desc'] }),
        ],
        filters: [
          this.validatorService.rules.listFilters<
            Omit<ProductModel, 'id' | 'deleteUserId' | 'deletedAt'>
          >({
            schema: {
              name: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.length({ minLength: 6, maxLength: 255 }),
                  ],
                }),
              ],
              category: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.in({ values: ['clothes', 'shoes', 'others'] }),
                  ],
                }),
              ],
              price: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.integer(),
                    this.validatorService.rules.max({ value: MAX_INTEGER }),
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
